/**
 * Sync Manager for handling automatic synchronization of notes
 */

import { getModifiedNotes, updateNoteWithRealId, updateNote, markNoteSynced } from './indexedDB';
import { syncNotes } from './whiteboardApi';

class SyncManager {
  constructor() {
    this.syncInterval = null;
    this.isRunning = false;
    this.token = null;
    this.syncIntervalMs = 60000; // 1 minute
    this.callbacks = {
      onSyncStart: null,
      onSyncComplete: null,
      onSyncError: null,
    };
  }

  /**
   * Start the sync manager
   * @param {string} token - Authorization token
   * @param {Object} callbacks - Event callbacks
   */
  start(token, callbacks = {}) {
    if (this.isRunning) {
      console.log('Sync manager is already running');
      return;
    }

    this.token = token;
    this.callbacks = { ...this.callbacks, ...callbacks };
    this.isRunning = true;

    console.log('Starting sync manager with 1-minute interval');
    
    // Start the interval
    this.syncInterval = setInterval(() => {
      this.performSync();
    }, this.syncIntervalMs);

    // Perform initial sync
    this.performSync();
  }

  /**
   * Stop the sync manager
   */
  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.isRunning = false;
    this.token = null;
  }

  /**
   * Perform synchronization of modified notes
   */
  async performSync() {
    if (!this.token) {
      console.log('No token available for sync');
      return;
    }

    try {
      this.callbacks.onSyncStart?.();
      
      // Get all modified notes
      const { success, notes } = await getModifiedNotes();
      
      if (!success) {
        throw new Error('Failed to get modified notes from IndexedDB');
      }

      if (!notes || notes.length === 0) {
        console.log('No modified notes to sync');
        this.callbacks.onSyncComplete?.(0);
        return;
      }

      console.log(`Syncing ${notes.length} modified notes`);

      // Prepare notes for API: use noteId and include changed fields only
      const notesToSync = notes.map(note => {
        const syncData = { noteId: note.noteId };

        const dirty = note.dirty || {};
        // Include content if dirty
        if (dirty.content) {
          syncData.content = note.content;
        }
        // Include only changed properties
        if (dirty.properties && typeof note.properties === 'object') {
          const propsPatch = {};
          for (const key of Object.keys(dirty.properties)) {
            if (dirty.properties[key]) {
              propsPatch[key] = note.properties[key];
            }
          }
          if (Object.keys(propsPatch).length > 0) {
            syncData.properties = propsPatch;
          }
        }

        // Fallback: if no dirty map present, send full properties/content if available
        if (!syncData.content && note.content !== undefined && note.lastSyncedContent === undefined) {
          syncData.content = note.content;
        }
        if (!syncData.properties && note.properties && note.lastSyncedProperties === undefined) {
          syncData.properties = note.properties;
        }

        return syncData;
      });

      // Call sync API
      console.log('notesToSync', notesToSync);
      console.log('this.token', this.token);
      const syncResult = await syncNotes(this.token, notesToSync);

      if (!syncResult.success) {
        if (syncResult.status === 401 || syncResult.status === 403 || syncResult.error === 'AUTH_REQUIRED') {
          // Stop syncing and surface clear auth error
          this.stop();
          const authError = new Error('Authentication required. Please log in again.');
          this.callbacks.onSyncError?.(authError);
          return;
        }
        throw new Error(syncResult.error || 'Failed to sync notes');
      }

      // Process sync results
      const syncResults = syncResult.syncResults || [];
      let updatedCount = 0;

      for (const result of syncResults) {
        const { sendNoteId, realNoteId, modifyFlag } = result;
        const normalizedFlag = modifyFlag ? 1 : 0;
        
        if (sendNoteId < 0 && realNoteId > 0) {
          // Update negative ID with real ID
          await updateNoteWithRealId(sendNoteId, realNoteId);
          // After ID update, mark new real note as synced
          await markNoteSynced(realNoteId, normalizedFlag);
          updatedCount++;
        } else if (sendNoteId > 0) {
          // Mark existing note as synced using backend flag
          await markNoteSynced(sendNoteId, normalizedFlag);
          updatedCount++;
        }
      }

      console.log(`Successfully synced ${updatedCount} notes`);
      this.callbacks.onSyncComplete?.(updatedCount);

    } catch (error) {
      console.error('Sync error:', error);
      this.callbacks.onSyncError?.(error);
    }
  }

  /**
   * Force immediate sync
   */
  async forcSync() {
    if (!this.isRunning) {
      console.log('Sync manager is not running');
      return;
    }
    
    await this.performSync();
  }

  /**
   * Update token
   * @param {string} token - New authorization token
   */
  updateToken(token) {
    this.token = token;
  }

  /**
   * Check if sync manager is running
   */
  get running() {
    return this.isRunning;
  }
}

// Export singleton instance
export const syncManager = new SyncManager();

// Export class for testing
export { SyncManager };

/**
 * Helper function to start sync manager
 * @param {string} token - Authorization token
 * @param {Object} callbacks - Event callbacks
 */
export const startSyncManager = (token, callbacks = {}) => {
  syncManager.start(token, callbacks);
};

/**
 * Helper function to stop sync manager
 */
export const stopSyncManager = () => {
  syncManager.stop();
};

/**
 * Helper function to force sync
 */
export const forceSync = async () => {
  await syncManager.forcSync();
};