// Central data source for "ideation" style questions (as in your previous version)
// We keep a LeetCode-like listing UI, but the problems are prompts to answer.
export const QUESTIONS = [
  {
    id: 'everyday-problem-easier-or-cheaper',
    title: 'What everyday problem do you wish had an easier or cheaper solution?',
    details:
      'Think of a recurring annoyance or cost in your routine (home, work, commute, purchases). Describe the problem clearly, who experiences it, how often, and current workarounds. Propose a simpler or more affordable approach and why it would be viable.'
  },
  {
    id: 'unlimited-resources-build-tomorrow',
    title: 'If you had unlimited resources, what product or service would you create tomorrow?',
    details:
      'Imagine you could build without constraints. Outline the vision, target users, core features, and the main problem it solves. Explain why now is the right time and what would make it 10x better than alternatives.'
  },
  {
    id: 'frustrating-experience-this-month',
    title: 'What’s one frustrating experience you’ve had this month that technology could fix?',
    details:
      'Describe the situation and steps that were frustrating. Identify the root cause and propose a technology-assisted improvement. Consider privacy, accessibility, and edge cases.'
  },
  {
    id: 'hobby-more-enjoyable-or-accessible',
    title: 'How could your favorite hobby be made more enjoyable or accessible to others?',
    details:
      'Pick a hobby you love. List the barriers for beginners (cost, complexity, time, gear). Suggest tools, content, or community features that reduce friction and improve retention.'
  },
  {
    id: 'outdated-process-needs-innovation',
    title: 'Which outdated process in your city or workplace desperately needs innovation?',
    details:
      'Spot a slow, paper-heavy, or manual workflow. Map the current steps, stakeholders, and bottlenecks. Propose a streamlined flow and quantify potential gains in time, cost, or satisfaction.'
  },
  {
    id: 'small-change-big-difference-health-happiness',
    title: 'What’s a small change that could make a big difference in people’s health or happiness?',
    details:
      'Focus on micro-habits, nudges, or environment tweaks that drive meaningful outcomes. Explain the psychology behind the change and how you would encourage adoption.'
  },
  {
    id: 'merge-two-products-why',
    title: 'If you could merge two existing products or services, what would they be and why?',
    details:
      'Choose two products with complementary strengths. Describe the combined experience, user journey, and how the merger creates new value that neither delivers alone.'
  },
  {
    id: 'community-problem-no-one-working-on',
    title: 'What’s a problem in your community that nobody seems to be working on yet?',
    details:
      'Define the community and the overlooked problem. Provide evidence of impact and who is affected. Suggest a practical initiative or MVP and what success would look like.'
  },
  {
    id: 'make-something-sustainable-eco-friendly',
    title: 'How could you make something more sustainable, eco-friendly, or waste-free?',
    details:
      'Pick a product or process and analyze its lifecycle. Propose material, design, or logistics changes to reduce waste or emissions. Consider trade-offs and incentives.'
  },
  {
    id: 'unique-skill-into-product-or-service',
    title: 'What’s a unique skill or knowledge you have that could be turned into a product or service?',
    details:
      'List your niche skills. Describe a productized service, course, or tool people would pay for. Identify target audience, distribution channels, and a simple validation plan.'
  }
];

export const getQuestionById = (id) => QUESTIONS.find(q => q.id === id);


