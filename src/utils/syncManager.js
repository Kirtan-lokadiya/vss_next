/**
 * Sync Manager for handling automatic synchronization of notes
 */

import { getModifiedNotes, updateNoteWithRealId, updateNote } from './indexedDB';
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
    console.log('Sync manager stopped');
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

      // Prepare notes for API
      const notesToSync = notes.map(note => {
        const syncData = {
          sendNoteId: note.sendNoteId || note.noteId,
        };

        // Only include changed properties
        if (note.content !== undefined) {
          syncData.content = note.content;
        }

        if (note.properties) {
          syncData.properties = note.properties;
        }

        return syncData;
      });

      // Call sync API
      const syncResult = await syncNotes(this.token, notesToSync);

      if (!syncResult.success) {
        throw new Error(syncResult.error || 'Failed to sync notes');
      }

      // Process sync results
      const syncResults = syncResult.syncResults || [];
      let updatedCount = 0;

      for (const result of syncResults) {
        const { sendNoteId, realNoteId, modifyFlag } = result;
        
        if (sendNoteId < 0 && realNoteId > 0) {
          // Update negative ID with real ID
          await updateNoteWithRealId(sendNoteId, realNoteId);
          updatedCount++;
        } else if (sendNoteId > 0) {
          // Update existing note to clear modifyFlag
          await updateNote(sendNoteId, { modifyFlag: 0 });
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