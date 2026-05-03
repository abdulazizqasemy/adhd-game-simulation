# ADHD Game Simulation - Design & Implementation Plan

## Design Philosophy
**"Therapeutic Engagement"** - A balance between clinical precision and child-friendly playfulness. The interface combines:
- Clear, colorful visuals that appeal to children
- Smooth animations and satisfying feedback
- Progress tracking that motivates continued play
- Narrative elements that create emotional investment
- Accessibility-first approach for users with ADHD

## Color Palette
- **Primary (Warm Accent):** #FF6B6B (coral red) - for gems, rewards, success states
- **Secondary (Cool Accent):** #4ECDC4 (teal) - for interactive elements, progress
- **Background:** #F8F9FA (soft light gray) - reduces visual strain
- **Text Primary:** #2C3E50 (dark slate) - excellent readability
- **Text Secondary:** #7F8C8D (medium gray) - secondary information
- **Success:** #2ECC71 (green) - correct answers, achievements
- **Warning:** #F39C12 (orange) - attention needed
- **Card Background:** #FFFFFF (white) - clean, organized sections

## Typography
- **Display Font:** "Fredoka One" (Google Fonts) - playful, friendly, bold
- **Body Font:** "Poppins" (Google Fonts) - modern, readable, slightly rounded
- **Sizes:**
  - Display: 48px (titles)
  - Heading: 32px (section titles)
  - Subheading: 24px (task titles)
  - Body: 16px (instructions)
  - Small: 14px (labels, hints)

## Layout Structure

### Main Navigation
- Top banner with game title, current level, gem counter, and progress bar
- Sidebar (mobile: bottom nav) with quick access to:
  - Home/Dashboard
  - Current Task
  - Achievements
  - Settings

### Game Screens

#### 1. Dashboard/Home
- Welcome message with character (warrior illustration)
- Current progress overview
- Available tasks/levels
- Total gems earned
- Quick stats

#### 2. Treasure Chest Game
- Central game area with animated treasure chests
- Gem counter at top
- Task instructions
- Difficulty indicator
- Timer (optional)
- Feedback animations

#### 3. Anti-Saccade Task
- Central fixation point
- Target dot positions
- Response tracking
- Accuracy feedback
- Completion progress

#### 4. Delayed-Saccade Task
- Central fixation point
- Target dot presentation
- Delay period visualization
- Position recall interface
- Performance metrics

#### 5. Continuous Performance Test (Go/No-Go)
- Rapid stimulus presentation area
- Response buttons/indicators
- Real-time accuracy display
- Trial counter

#### 6. Rewards Screen
- Gem collection display
- Pet/reward unlocks
- Progress toward next reward
- Celebration animations

## Component Architecture

```
App
├── Layout
│   ├── Header (title, gems, progress)
│   ├── Navigation (sidebar/bottom nav)
│   └── MainContent
│       └── Router
│           ├── Dashboard
│           ├── TreasureChestGame
│           ├── AntiSaccadeTask
│           ├── DelayedSaccadeTask
│           ├── ContinuousPerformanceTest
│           ├── RewardsScreen
│           └── Settings
├── GameState (Context)
│   ├── gemsCollected
│   ├── currentTask
│   ├── completedTasks
│   ├── achievements
│   └── difficulty
├── UI Components
│   ├── Card
│   ├── Button
│   ├── ProgressBar
│   ├── GemCounter
│   ├── TaskCard
│   └── AnimatedFeedback
└── Hooks
    ├── useGameState
    ├── useTaskTimer
    └── usePerformanceTracking
```

## Animation Strategy
- **Entrance:** Fade-in with slight scale (200ms)
- **Gem Collection:** Bounce animation + particle effects
- **Success:** Confetti or celebratory animation
- **Feedback:** Quick pulse or color change
- **Transitions:** Smooth slide between screens (300ms)

## Accessibility Features
- High contrast text on backgrounds
- Clear focus indicators for keyboard navigation
- ARIA labels for interactive elements
- Reduced motion option for sensitive users
- Clear instructions before each task
- Audio feedback option (optional)

## Implementation Phases

### Phase 1: Foundation
- [ ] Set up project structure
- [ ] Create color palette and typography system
- [ ] Build basic layout and navigation
- [ ] Implement GameState context

### Phase 2: Dashboard & Navigation
- [ ] Create Dashboard component
- [ ] Build navigation system
- [ ] Add gem counter and progress tracking
- [ ] Implement basic animations

### Phase 3: Treasure Chest Game
- [ ] Create animated treasure chests
- [ ] Implement gem identification logic
- [ ] Add difficulty levels
- [ ] Create feedback system

### Phase 4: Cognitive Tasks
- [ ] Anti-Saccade task simulator
- [ ] Delayed-Saccade task simulator
- [ ] Continuous Performance Test
- [ ] Performance tracking and scoring

### Phase 5: Rewards & Progression
- [ ] Gem collection system
- [ ] Pet/reward unlocks
- [ ] Achievement system
- [ ] Progress persistence (localStorage)

### Phase 6: Polish & Testing
- [ ] Animations and transitions
- [ ] Accessibility audit
- [ ] Mobile responsiveness
- [ ] User feedback and refinement

## Performance Considerations
- Lazy load task components
- Optimize animations with CSS transforms
- Debounce rapid interactions
- Cache game state in localStorage
- Use React.memo for frequently re-rendered components

## Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile-first responsive design
- Touch-friendly interface elements
- Fallbacks for unsupported features
