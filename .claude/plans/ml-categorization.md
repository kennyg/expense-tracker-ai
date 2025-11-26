================================================================================
ML-POWERED EXPENSE CATEGORIZATION SYSTEM - TECHNICAL ANALYSIS
================================================================================
Document Version: 1.0
Date: 2025-11-26
Current Stack: Next.js 16 + React 19 + TypeScript + LocalStorage

================================================================================
TABLE OF CONTENTS
================================================================================
1. Core Technical Challenges
2. Data Collection Requirements
3. ML Approaches & Recommendations
4. Privacy & Data Security
5. User Experience Flow
6. Edge Cases & Error Handling
7. Deployment & Maintenance Strategy
8. Implementation Phases

================================================================================
1. CORE TECHNICAL CHALLENGES
================================================================================

1.1 ARCHITECTURE GAP: NO BACKEND
--------------------------------
Current State: Fully client-side with localStorage
Challenge: ML models need either:
  - Server-side inference (requires API routes)
  - Client-side TensorFlow.js (larger bundle, slower)

Solutions:
  A) Add Next.js API routes (/app/api/categorize) - RECOMMENDED
     - Run inference on server
     - Keep models out of client bundle
     - Enable centralized learning

  B) TensorFlow.js in browser
     - ~3MB additional bundle size
     - Model stored in IndexedDB
     - No cross-device learning
     - Works offline

  C) Hybrid approach
     - Rule-based system runs client-side
     - ML model runs server-side when available
     - Graceful degradation

1.2 LIMITED TRAINING DATA
-------------------------
Challenge: New users have no expense history
Cold Start Problem Severity: HIGH

Solutions:
  - Pre-trained model on common merchant patterns
  - Rule-based fallbacks for common keywords
  - Community/aggregate learning (privacy-preserving)
  - Transfer learning from public datasets

1.3 CATEGORY CONSTRAINTS
------------------------
Current: 6 hardcoded categories
  ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Other']

Challenges:
  - Limited granularity (no "Healthcare", "Travel", "Subscriptions")
  - "Other" becomes catch-all bucket
  - No custom user categories

Recommendation: Consider expanding to 10-12 categories or allowing custom
categories with ML mapping to parent categories.

1.4 FEATURE EXTRACTION FROM UNSTRUCTURED TEXT
---------------------------------------------
Primary Feature: expense.description field
Examples of real input variations:
  - "Starbucks coffee"
  - "AMZN*Marketplace Seattle WA"
  - "gas station"
  - "groceries"
  - "dinner with friends"

Challenges:
  - No consistent format (bank import vs manual entry)
  - Abbreviations and variations
  - Mixed case, special characters
  - Multiple merchants in one description

Text Processing Pipeline Required:
  1. Lowercase normalization
  2. Special character cleanup
  3. Merchant name extraction
  4. Keyword tokenization
  5. N-gram generation for compound terms

1.5 MODEL PERFORMANCE VS SIZE TRADEOFF
--------------------------------------
Constraint: Must feel instant (<100ms suggestion latency)

Options by complexity:
  Model Type          | Accuracy | Latency | Size
  --------------------|----------|---------|--------
  Keyword rules       | 60-70%   | <5ms    | <10KB
  Naive Bayes         | 75-85%   | <10ms   | <100KB
  TF-IDF + LogReg     | 80-88%   | <20ms   | <500KB
  Neural Network      | 85-92%   | 50-100ms| 1-5MB
  Transformer (tiny)  | 88-95%   | 100-200ms| 5-20MB

RECOMMENDATION: Start with Naive Bayes, upgrade to Neural as data grows

1.6 CONCEPT DRIFT
-----------------
User behavior changes over time:
  - New merchants/services emerge
  - Personal categorization preferences evolve
  - Seasonal spending patterns

Solution: Continuous learning with rolling window (last 6 months weighted)

================================================================================
2. DATA COLLECTION REQUIREMENTS
================================================================================

2.1 REQUIRED DATA POINTS FOR ML
-------------------------------
MUST HAVE (for basic classification):
  - description: string       // Primary feature
  - category: string          // Label
  - amount: number            // Secondary feature
  - date: string              // Temporal patterns

SHOULD HAVE (for improved accuracy):
  - userConfirmedCategory: boolean    // Did user accept suggestion?
  - originalSuggestion: string        // What ML predicted
  - confidenceScore: number           // Model certainty
  - vendor: string                    // Extracted merchant name

NICE TO HAVE (for advanced features):
  - location: {lat, lng}              // Geo patterns
  - paymentMethod: string             // Card-specific patterns
  - isRecurring: boolean              // Subscription detection
  - tags: string[]                    // User-defined subtags

2.2 PROPOSED EXTENDED DATA MODEL
--------------------------------
interface ExpenseML extends Expense {
  // ML-specific fields
  mlSuggestedCategory: ExpenseCategory | null;
  mlConfidence: number;              // 0.0 to 1.0
  userAcceptedSuggestion: boolean;
  extractedVendor: string | null;

  // Feature engineering fields
  normalizedDescription: string;      // Cleaned, lowercase
  descriptionTokens: string[];        // For bag-of-words
  amountBucket: 'micro' | 'small' | 'medium' | 'large' | 'xlarge';
  dayOfWeek: number;                  // 0-6
  isWeekend: boolean;
}

Amount Buckets:
  - micro: $0-10
  - small: $10-50
  - medium: $50-150
  - large: $150-500
  - xlarge: $500+

2.3 TRAINING DATA COLLECTION STRATEGY
-------------------------------------
Phase 1: Bootstrap with Rules
  - Parse existing localStorage expenses
  - Apply keyword rules to generate pseudo-labels
  - Build initial vocabulary

Phase 2: Active Learning
  - Show ML suggestion alongside manual selection
  - Track when user overrides suggestion
  - Weight corrections higher in training

Phase 3: Feedback Loop Schema
  CREATE TABLE categorization_feedback (
    id UUID PRIMARY KEY,
    description TEXT,
    amount DECIMAL,
    predicted_category VARCHAR(50),
    actual_category VARCHAR(50),
    confidence FLOAT,
    was_accepted BOOLEAN,
    correction_time_ms INT,     -- Time to correct (indicates confusion)
    created_at TIMESTAMP
  );

2.4 MINIMUM VIABLE TRAINING SET
-------------------------------
For personalized model to be effective:
  - Minimum: 50 expenses per category
  - Good: 100+ expenses per category
  - Excellent: 500+ expenses total

Cold Start Mitigation:
  - Pre-train on public expense datasets
  - Use generic keyword dictionary
  - Confidence threshold: Only suggest when >70% confident

================================================================================
3. ML APPROACHES & RECOMMENDATIONS
================================================================================

3.1 APPROACH COMPARISON MATRIX
------------------------------
Approach           | Complexity | Accuracy | Data Needed | Interpretable
-------------------|------------|----------|-------------|---------------
Keyword Matching   | Low        | 60-70%   | None        | Yes
Naive Bayes        | Low        | 75-85%   | 200+        | Yes
TF-IDF + SVM       | Medium     | 80-88%   | 500+        | Partial
Random Forest      | Medium     | 82-88%   | 500+        | Partial
Neural Network     | High       | 85-92%   | 1000+       | No
Fine-tuned LLM     | Very High  | 90-95%   | 100+        | Partial

3.2 RECOMMENDED ARCHITECTURE: TIERED APPROACH
---------------------------------------------
TIER 1: Rule-Based System (Always available)
  - Runs client-side, zero latency
  - Keyword dictionaries for common merchants
  - Regex patterns for bank transaction formats
  - Returns category + confidence

  Example Rules:
    /starbucks|dunkin|coffee/i → Food (0.95)
    /uber|lyft|taxi/i → Transportation (0.95)
    /netflix|spotify|hulu/i → Entertainment (0.90)
    /amazon|walmart|target/i → Shopping (0.70)  // Lower confidence
    /electric|water|internet|phone/i → Bills (0.85)

TIER 2: Statistical Model (When enough data)
  - Naive Bayes classifier
  - Trained on user's historical data
  - Bag-of-words + amount features
  - Runs server-side via API

TIER 3: Neural Network (Future enhancement)
  - Character-level CNN or small transformer
  - Handles typos and variations
  - Only activate after 1000+ expenses

3.3 FEATURE ENGINEERING PIPELINE
--------------------------------
Input: "AMZN*Marketplace Seattle 12.99"

Step 1: Preprocessing
  → "amzn marketplace seattle 12.99"

Step 2: Token Extraction
  → ["amzn", "marketplace", "seattle"]

Step 3: Merchant Detection
  → vendor: "amazon" (from alias dictionary)

Step 4: Feature Vector Construction
  features = {
    tokens: ["amzn", "marketplace", "seattle"],
    vendor: "amazon",
    amount_bucket: "small",
    day_of_week: 3,
    is_weekend: false,
    has_location: true,
    token_count: 3
  }

Step 5: Model Inference
  → {category: "Shopping", confidence: 0.87}

3.4 NAIVE BAYES IMPLEMENTATION SKETCH
-------------------------------------
class ExpenseCategorizer {
  // Word frequencies per category
  private wordCounts: Map<Category, Map<string, number>>;
  private categoryPriors: Map<Category, number>;
  private vocabulary: Set<string>;

  train(expenses: Expense[]): void {
    // Calculate P(category) priors
    // Calculate P(word|category) likelihoods
    // Apply Laplace smoothing for unseen words
  }

  predict(description: string): {category: Category, confidence: number} {
    const tokens = this.tokenize(description);
    let maxScore = -Infinity;
    let bestCategory: Category;

    for (const category of CATEGORIES) {
      // log P(category) + sum(log P(word|category))
      const score = this.calculatePosterior(tokens, category);
      if (score > maxScore) {
        maxScore = score;
        bestCategory = category;
      }
    }

    const confidence = this.softmax(scores)[bestCategory];
    return { category: bestCategory, confidence };
  }
}

3.5 HYBRID DECISION LOGIC
-------------------------
function suggestCategory(expense: ExpenseInput): Suggestion {
  // Tier 1: Check rule-based first
  const ruleResult = applyKeywordRules(expense.description);
  if (ruleResult.confidence > 0.9) {
    return ruleResult; // High-confidence rule match
  }

  // Tier 2: Check ML model
  const mlResult = await mlModel.predict(expense);
  if (mlResult.confidence > 0.7) {
    return mlResult;
  }

  // Tier 3: Combine signals
  if (ruleResult.confidence > 0 && mlResult.confidence > 0) {
    return combineSignals(ruleResult, mlResult);
  }

  // Fallback: No confident suggestion
  return { category: null, confidence: 0, showPicker: true };
}

================================================================================
4. PRIVACY & DATA SECURITY
================================================================================

4.1 DATA SENSITIVITY CLASSIFICATION
-----------------------------------
HIGH SENSITIVITY:
  - Expense descriptions (may contain personal info)
  - Spending patterns (behavioral profiling risk)
  - Location data (if collected)

MEDIUM SENSITIVITY:
  - Category distributions
  - Aggregate amounts
  - Temporal patterns

LOW SENSITIVITY:
  - Anonymous, aggregated keyword frequencies
  - Category priors

4.2 LOCAL-FIRST ARCHITECTURE (RECOMMENDED)
------------------------------------------
Principle: All personal expense data stays on user's device

Implementation:
  ┌─────────────────────────────────────────────────────┐
  │                    USER DEVICE                       │
  │  ┌─────────────┐    ┌─────────────┐                 │
  │  │ Raw Expense │───▶│ ML Model    │                 │
  │  │ Data        │    │ (Local)     │                 │
  │  └─────────────┘    └─────────────┘                 │
  │         │                  ▲                         │
  │         ▼                  │ Download               │
  │  ┌─────────────┐    ┌──────┴──────┐                 │
  │  │ Training    │───▶│ Model       │                 │
  │  │ (Local)     │    │ Updates     │                 │
  │  └─────────────┘    └─────────────┘                 │
  └─────────────────────────────────────────────────────┘
                             │
               Optional: Federated Learning
                             ▼
                    ┌─────────────┐
                    │ Server      │
                    │ (Gradients  │
                    │ only, not   │
                    │ raw data)   │
                    └─────────────┘

4.3 IF USING SERVER-SIDE PROCESSING
------------------------------------
Security Measures Required:

A) In Transit:
  - TLS 1.3 for all API calls
  - Certificate pinning for mobile apps
  - Request signing to prevent tampering

B) At Rest:
  - Encrypt expense data with user-specific keys
  - No plaintext storage of descriptions
  - Separate encryption for PII fields

C) Processing:
  - Stateless inference (no logging of inputs)
  - Memory cleared after prediction
  - No training on server without consent

4.4 PRIVACY-PRESERVING ML OPTIONS
---------------------------------
Option A: On-Device Training Only
  - Model trains and runs entirely in browser
  - Zero data leaves device
  - Limited by browser compute power
  - No cross-device sync

Option B: Federated Learning
  - Train locally, share only model updates
  - Differential privacy for gradient noise
  - Secure aggregation across users
  - Complex infrastructure

Option C: Privacy-Preserving Features Only
  - Extract non-identifying features client-side
  - Send only hashed/tokenized data to server
  - Example: "starbucks" → hash("starbucks") → "a7f3..."

4.5 COMPLIANCE CONSIDERATIONS
-----------------------------
GDPR (if EU users):
  - Right to explanation (interpretable models preferred)
  - Right to deletion (must support model unlearning)
  - Data portability (export user's training data)
  - Consent required for processing

CCPA (if California users):
  - Opt-out of "sale" of data
  - Disclosure of data categories collected

Recommendation: Implement consent UI before ML features

4.6 DATA RETENTION POLICY
-------------------------
Raw Expense Data: Indefinite (user-controlled localStorage)
ML Training Data: Rolling 12-month window
Model Weights: Until new model trained
Feedback Data: 90 days, then aggregated only
Deleted Expenses: Immediate removal, retrain on next cycle

================================================================================
5. USER EXPERIENCE FLOW
================================================================================

5.1 SUGGESTION DISPLAY STATES
-----------------------------
State A: High Confidence (>85%)
  ┌────────────────────────────────────────┐
  │ Category: [Food ✨ Auto-suggested]     │
  │                                        │
  │ Based on "Starbucks" → Food (95%)     │
  │                                        │
  │ [✓ Accept]  [Change Category ▼]       │
  └────────────────────────────────────────┘

State B: Medium Confidence (60-85%)
  ┌────────────────────────────────────────┐
  │ Suggested: [Shopping?]                 │
  │                                        │
  │ Or select: [Food] [Transport] [Other]  │
  │                                        │
  │ "Amazon purchase" could be several     │
  └────────────────────────────────────────┘

State C: Low Confidence (<60%)
  ┌────────────────────────────────────────┐
  │ Select category:                       │
  │                                        │
  │ [🍕Food] [🚗Transport] [🎬Fun]        │
  │ [🛍Shop] [📄Bills] [📦Other]          │
  │                                        │
  │ We'll learn your preferences!          │
  └────────────────────────────────────────┘

5.2 INLINE SUGGESTION INTERACTION
---------------------------------
On Description Input (debounced 300ms):
  1. User types "uber ride to airport"
  2. Show typing indicator under category buttons
  3. ML returns {Transportation, 0.92}
  4. Animate highlight on Transportation button
  5. Show small "Suggested" badge

On Category Selection:
  - If matches suggestion: Record as accepted
  - If differs: Record as correction, animate feedback
  - Show brief "Got it! I'll remember that." toast

5.3 BULK IMPORT FLOW
--------------------
When importing CSV/bank statement:
  ┌────────────────────────────────────────────────────┐
  │ Importing 47 expenses...                           │
  │                                                    │
  │ Auto-categorized: 38 (81%)                        │
  │ ████████████████████░░░░░░                        │
  │                                                    │
  │ Need your help with 9 expenses:                   │
  │                                                    │
  │ ┌──────────────────────────────────────────────┐  │
  │ │ WHOLEFDS MKT #123     $67.23                 │  │
  │ │ [Food?] [Shopping] [Other]                   │  │
  │ └──────────────────────────────────────────────┘  │
  │                                                    │
  │ [Skip] [Apply to Similar]                         │
  └────────────────────────────────────────────────────┘

5.4 SETTINGS & CONTROL
----------------------
ML Settings Page:
  ┌────────────────────────────────────────┐
  │ Smart Categories                       │
  │ ───────────────────────────────────    │
  │                                        │
  │ Auto-categorization      [ON ●   ]     │
  │                                        │
  │ Suggestion threshold     [███░░] 70%   │
  │ (Only suggest above this confidence)   │
  │                                        │
  │ Learning mode            [Balanced ▼]  │
  │  • Conservative (more manual picks)    │
  │  • Balanced                            │
  │  • Aggressive (more auto-categorize)   │
  │                                        │
  │ [View Learning Stats]                  │
  │ [Reset Learning Data]                  │
  └────────────────────────────────────────┘

5.5 FEEDBACK & CORRECTION FLOW
------------------------------
When user corrects a suggestion:

Subtle Feedback (default):
  - Category changes with brief animation
  - Small "Learned!" indicator fades in/out

Detailed Feedback (in settings):
  - "Changed from Shopping to Bills"
  - "Future 'netflix' expenses → Bills"

Batch Correction Prompt (when pattern detected):
  "You've categorized 3 'Netflix' expenses as Bills.
   Apply to 5 similar past expenses?"
   [Yes, Update All] [No, Just This One]

5.6 ONBOARDING FOR ML FEATURES
------------------------------
First-Time User Flow:
  1. Normal expense creation (no ML yet)
  2. After 10 expenses: "Enable Smart Categories?"
  3. Show benefit: "Save time with auto-suggestions"
  4. Explain: "Learns from your choices, all on-device"
  5. Optional: Import bank data to bootstrap

Returning User (existing data):
  1. Analyze existing expenses
  2. "Found 150 expenses. Train your personal model?"
  3. Show accuracy preview on sample
  4. Enable if accuracy > 75%

================================================================================
6. EDGE CASES & ERROR HANDLING
================================================================================

6.1 COLD START SCENARIOS
------------------------
Scenario: Brand new user, 0 expenses
  - Disable ML suggestions
  - Use keyword rules only
  - Show "Learning..." state
  - Threshold: Enable ML after 20 expenses

Scenario: User with data but new category
  - No training data for new category
  - Fallback to keyword matching
  - Actively prompt for examples

Scenario: User with skewed data (90% Food)
  - Model over-predicts Food
  - Apply class balancing/weighting
  - Track per-category accuracy

6.2 AMBIGUOUS INPUTS
--------------------
Input: "Amazon"
Problem: Could be Food (Fresh), Shopping, Entertainment (Prime)
Solution:
  - Show multiple suggestions with probabilities
  - Check historical pattern for this user
  - Amount helps: $14.99 likely Prime, $150 likely Shopping
  - "Amazon" appearing with "Fresh" → Food

Input: "ATM Withdrawal"
Problem: Actual use unknown
Solution:
  - Mark as "Uncategorizable"
  - Don't use for training
  - Prompt: "What was this cash used for?"

Input: "" (empty description)
Problem: No features to analyze
Solution:
  - Don't suggest, require manual selection
  - Flag as low-quality data point

6.3 MODEL FAILURES
------------------
Scenario: Model returns invalid category
  Guard: Validate output against EXPENSE_CATEGORIES
  Fallback: Return 'Other' with 0 confidence

Scenario: Model inference timeout (>500ms)
  Guard: Set 300ms timeout on prediction
  Fallback: Show category picker immediately
  Background: Complete prediction, don't show

Scenario: Model file corrupted
  Guard: Checksum validation on load
  Fallback: Re-download or use rules only
  Recovery: Offer to retrain from scratch

Scenario: TensorFlow.js fails to load
  Guard: Try-catch model initialization
  Fallback: Feature detection, rule-based only
  UI: "Smart categories unavailable" badge

6.4 DATA QUALITY ISSUES
-----------------------
Issue: Garbage/random text in description
  Detection: Entropy analysis (high = random)
  Handling: Exclude from training, no suggestion

Issue: Inconsistent user categorization
  Detection: Same description, different categories
  Handling: Use most recent preference
  UI: "You've categorized 'Uber' as both Transport and Other"

Issue: Very short descriptions (<3 chars)
  Handling: Low weight in training
  Suggestion: Lower confidence ceiling (max 60%)

Issue: Very long descriptions (>500 chars)
  Handling: Truncate to first 100 chars
  Reason: Likely bank memo, key info at start

6.5 ADVERSARIAL SCENARIOS
-------------------------
Scenario: User tries to "game" the system
  - Entering nonsense to test
  - Deliberately miscategorizing
  Detection: Anomaly scoring
  Handling: Require threshold of consistent data

Scenario: Imported data from compromised source
  - Malformed CSV
  - Injection attempts in description
  Handling: Strict input sanitization
  Handling: Limit import batch size

6.6 ERROR MESSAGE GUIDELINES
----------------------------
User-Facing Messages (friendly):
  ❌ "NaN confidence score in prediction pipeline"
  ✅ "Couldn't suggest a category. Please select one."

  ❌ "Model training failed: insufficient data points"
  ✅ "Need a few more expenses to learn your preferences"

  ❌ "TensorFlow WASM backend initialization error"
  ✅ "Smart categories temporarily unavailable"

Logging (for debugging):
  - Log all prediction failures with context
  - Track suggestion acceptance rate over time
  - Alert if accuracy drops below threshold

================================================================================
7. DEPLOYMENT & MAINTENANCE STRATEGY
================================================================================

7.1 DEPLOYMENT OPTIONS
----------------------
Option A: Full Client-Side (Current Architecture)
  Pros:
    + No backend changes required
    + Works offline
    + Zero server costs
    + Full privacy
  Cons:
    - Larger JS bundle (~3MB for TF.js)
    - Slower initial load
    - No cross-device learning
    - Limited model complexity

Option B: Hybrid (Recommended for Production)
  Pros:
    + Small client bundle
    + Server handles heavy inference
    + Cross-device sync possible
    + Can upgrade models server-side
  Cons:
    - Requires API routes
    - Server costs
    - Latency for predictions
    - More complex deployment

Option C: Full Server-Side
  Pros:
    + Most powerful models possible
    + No client impact
    + Centralized training
  Cons:
    - Requires database
    - Privacy concerns
    - Doesn't work offline
    - Highest server costs

7.2 RECOMMENDED DEPLOYMENT ARCHITECTURE
---------------------------------------
                    ┌──────────────────┐
                    │   Vercel Edge    │
                    │   (Next.js App)  │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
       ┌───────────┐  ┌───────────┐  ┌───────────┐
       │ Static    │  │ API Route │  │ API Route │
       │ Assets    │  │ /suggest  │  │ /feedback │
       │ (CDN)     │  │           │  │           │
       └───────────┘  └─────┬─────┘  └─────┬─────┘
                            │              │
                      ┌─────▼──────────────▼─────┐
                      │      Serverless ML       │
                      │   (Edge-optimized)       │
                      │   - ONNX Runtime         │
                      │   - 50ms p99 latency     │
                      └──────────────────────────┘

For localStorage-only (current architecture):
  - Deploy TensorFlow.js Lite model
  - Store model in IndexedDB
  - Train/retrain client-side
  - No API routes needed

7.3 MODEL VERSIONING STRATEGY
-----------------------------
Version Schema: major.minor.patch-dataset
  Example: v2.1.0-2025Q1

Major: Architecture change (e.g., Naive Bayes → Neural)
Minor: Retraining with significant data additions
Patch: Bug fixes, small improvements
Dataset: Training data snapshot identifier

Model Registry:
  /models/
    /v1.0.0/
      model.json
      weights.bin
      metadata.json (training metrics, date, size)
    /v2.0.0/
      model.onnx
      metadata.json

Rollback Strategy:
  - Keep last 3 versions deployed
  - Feature flag to switch versions
  - Automatic rollback if accuracy drops >10%

7.4 MONITORING & OBSERVABILITY
------------------------------
Key Metrics to Track:

Prediction Quality:
  - Suggestion acceptance rate (target: >70%)
  - Correction rate per category
  - Mean confidence score
  - Accuracy vs confidence calibration

Performance:
  - P50/P95/P99 prediction latency
  - Model load time
  - Memory usage (browser)
  - Bundle size impact

User Engagement:
  - % users with ML enabled
  - Time saved (manual selection vs suggestion)
  - Feature adoption over time

Dashboard Alerts:
  - Acceptance rate drops below 60%
  - P99 latency exceeds 200ms
  - Error rate exceeds 1%
  - Model size exceeds budget

7.5 CONTINUOUS IMPROVEMENT PIPELINE
-----------------------------------
Weekly:
  - Review prediction accuracy by category
  - Identify top miscategorized merchants
  - Update keyword rules for common patterns

Monthly:
  - Retrain global model (if using federated learning)
  - A/B test model improvements
  - Review user feedback

Quarterly:
  - Evaluate new model architectures
  - Expand category taxonomy if needed
  - Major version release if improvements significant

7.6 A/B TESTING FRAMEWORK
-------------------------
Test Types:
  1. Model comparison (v1 vs v2)
  2. Threshold testing (70% vs 80% confidence)
  3. UX variants (inline vs modal suggestions)

Implementation:
  - Hash user ID to assign bucket
  - Store experiment assignment in localStorage
  - Track metrics separately per variant
  - Statistical significance: p < 0.05

7.7 DISASTER RECOVERY
---------------------
Scenario: Model completely broken
  1. Feature flag: Disable ML suggestions globally
  2. Users see manual category picker
  3. Deploy fixed model
  4. Gradually re-enable with monitoring

Scenario: Data corruption
  1. localStorage clear detection
  2. Re-download model from CDN
  3. Cold start experience (no personalization)
  4. User prompted to re-train

================================================================================
8. IMPLEMENTATION PHASES
================================================================================

PHASE 1: FOUNDATION (Week 1-2)
------------------------------
Goals:
  - Extend data model for ML fields
  - Build text preprocessing pipeline
  - Implement keyword rule system

Deliverables:
  [ ] Update Expense type with ML fields
  [ ] Create normalizeDescription() utility
  [ ] Build keyword → category rule dictionary (100+ rules)
  [ ] Add extractVendor() function
  [ ] Unit tests for text processing

Files to Modify:
  - src/types/expense.ts
  - src/lib/utils.ts (add ml-utils.ts)
  - src/context/ExpenseContext.tsx

PHASE 2: RULE-BASED SUGGESTIONS (Week 2-3)
------------------------------------------
Goals:
  - Implement client-side suggestion engine
  - Add UI for displaying suggestions
  - Track suggestion acceptance

Deliverables:
  [ ] KeywordCategorizer class
  [ ] Suggestion display in ExpenseForm
  [ ] Acceptance/correction tracking
  [ ] Settings toggle for feature

Files to Create/Modify:
  - src/lib/categorizer/keyword-rules.ts
  - src/components/ExpenseForm.tsx
  - src/components/CategorySuggestion.tsx

PHASE 3: NAIVE BAYES MODEL (Week 3-4)
-------------------------------------
Goals:
  - Implement trainable Naive Bayes classifier
  - Add training pipeline
  - Integrate with suggestion UI

Deliverables:
  [ ] NaiveBayesCategorizer class
  [ ] Training data extraction from history
  [ ] Model serialization to localStorage
  [ ] Hybrid rule + ML suggestion logic

Files to Create:
  - src/lib/categorizer/naive-bayes.ts
  - src/lib/categorizer/trainer.ts
  - src/lib/categorizer/index.ts

PHASE 4: FEEDBACK LOOP (Week 4-5)
---------------------------------
Goals:
  - Implement continuous learning
  - Add accuracy monitoring
  - Build settings/stats UI

Deliverables:
  [ ] Feedback collection system
  [ ] Incremental model updates
  [ ] Learning statistics page
  [ ] Reset/retrain controls

Files to Create/Modify:
  - src/app/settings/ml/page.tsx
  - src/components/LearningStats.tsx

PHASE 5: OPTIMIZATION (Week 5-6)
--------------------------------
Goals:
  - Optimize performance
  - Polish UX
  - Comprehensive testing

Deliverables:
  [ ] Bundle size optimization
  [ ] Latency improvements
  [ ] Edge case handling
  [ ] Integration tests
  [ ] User documentation

FUTURE PHASES:
--------------
Phase 6: Server-Side ML API (if scaling needed)
Phase 7: Neural Network Upgrade (if accuracy plateau)
Phase 8: Federated Learning (if multi-user product)

================================================================================
APPENDIX A: KEYWORD RULES STARTER SET
================================================================================

const KEYWORD_RULES: Record<string, {category: Category, confidence: number}> = {
  // Food - High Confidence
  'starbucks': { category: 'Food', confidence: 0.95 },
  'mcdonalds': { category: 'Food', confidence: 0.95 },
  'chipotle': { category: 'Food', confidence: 0.95 },
  'doordash': { category: 'Food', confidence: 0.90 },
  'uber eats': { category: 'Food', confidence: 0.90 },
  'grubhub': { category: 'Food', confidence: 0.90 },
  'restaurant': { category: 'Food', confidence: 0.85 },
  'pizza': { category: 'Food', confidence: 0.85 },
  'coffee': { category: 'Food', confidence: 0.85 },
  'grocery': { category: 'Food', confidence: 0.90 },
  'whole foods': { category: 'Food', confidence: 0.90 },
  'trader joe': { category: 'Food', confidence: 0.90 },

  // Transportation - High Confidence
  'uber': { category: 'Transportation', confidence: 0.85 },
  'lyft': { category: 'Transportation', confidence: 0.95 },
  'taxi': { category: 'Transportation', confidence: 0.95 },
  'gas station': { category: 'Transportation', confidence: 0.90 },
  'shell': { category: 'Transportation', confidence: 0.85 },
  'chevron': { category: 'Transportation', confidence: 0.85 },
  'parking': { category: 'Transportation', confidence: 0.90 },
  'toll': { category: 'Transportation', confidence: 0.90 },
  'metro': { category: 'Transportation', confidence: 0.85 },

  // Entertainment - High Confidence
  'netflix': { category: 'Entertainment', confidence: 0.95 },
  'spotify': { category: 'Entertainment', confidence: 0.95 },
  'hulu': { category: 'Entertainment', confidence: 0.95 },
  'disney+': { category: 'Entertainment', confidence: 0.95 },
  'movie': { category: 'Entertainment', confidence: 0.85 },
  'cinema': { category: 'Entertainment', confidence: 0.90 },
  'concert': { category: 'Entertainment', confidence: 0.90 },
  'game': { category: 'Entertainment', confidence: 0.70 },

  // Shopping - Medium Confidence (often ambiguous)
  'amazon': { category: 'Shopping', confidence: 0.65 },
  'walmart': { category: 'Shopping', confidence: 0.70 },
  'target': { category: 'Shopping', confidence: 0.70 },
  'best buy': { category: 'Shopping', confidence: 0.85 },
  'costco': { category: 'Shopping', confidence: 0.70 },

  // Bills - High Confidence
  'electric': { category: 'Bills', confidence: 0.90 },
  'water bill': { category: 'Bills', confidence: 0.95 },
  'internet': { category: 'Bills', confidence: 0.90 },
  'comcast': { category: 'Bills', confidence: 0.90 },
  'verizon': { category: 'Bills', confidence: 0.85 },
  'at&t': { category: 'Bills', confidence: 0.85 },
  'rent': { category: 'Bills', confidence: 0.95 },
  'insurance': { category: 'Bills', confidence: 0.90 },
};

================================================================================
APPENDIX B: ACCURACY TARGETS
================================================================================

Target Metrics by Phase:

Phase 2 (Rules Only):
  - Overall accuracy: 60-70%
  - High-confidence (>90%) accuracy: 95%+
  - Coverage (% with suggestion): 40%

Phase 3 (Rules + Naive Bayes):
  - Overall accuracy: 75-85%
  - High-confidence accuracy: 90%+
  - Coverage: 70%

Phase 5 (Optimized):
  - Overall accuracy: 80-88%
  - High-confidence accuracy: 92%+
  - Coverage: 85%

Future (Neural):
  - Overall accuracy: 88-95%
  - High-confidence accuracy: 95%+
  - Coverage: 95%

================================================================================
END OF DOCUMENT
================================================================================
