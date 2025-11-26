# ML-Powered Expense Categorization System

**Technical Analysis**

| | |
|---|---|
| Version | 1.0 |
| Date | 2025-11-26 |
| Stack | Next.js 16 + React 19 + TypeScript + LocalStorage |

---

## Table of Contents

1. [Core Technical Challenges](#1-core-technical-challenges)
2. [Data Collection Requirements](#2-data-collection-requirements)
3. [ML Approaches & Recommendations](#3-ml-approaches--recommendations)
4. [Privacy & Data Security](#4-privacy--data-security)
5. [User Experience Flow](#5-user-experience-flow)
6. [Edge Cases & Error Handling](#6-edge-cases--error-handling)
7. [Deployment & Maintenance Strategy](#7-deployment--maintenance-strategy)
8. [Implementation Phases](#8-implementation-phases)

---

## 1. Core Technical Challenges

### 1.1 Architecture Gap: No Backend

**Current State:** Fully client-side with localStorage

**Challenge:** ML models need either:
- Server-side inference (requires API routes)
- Client-side TensorFlow.js (larger bundle, slower)

**Solutions:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A) Next.js API routes | Run inference on server | Centralized learning, small client | Requires backend |
| B) TensorFlow.js | Model runs in browser | Works offline, full privacy | ~3MB bundle, no cross-device |
| C) Hybrid | Rules client-side, ML server-side | Graceful degradation | More complexity |

**Recommendation:** Option A (API routes)

### 1.2 Limited Training Data

**Challenge:** New users have no expense history
**Cold Start Problem Severity:** HIGH

**Solutions:**
- Pre-trained model on common merchant patterns
- Rule-based fallbacks for common keywords
- Community/aggregate learning (privacy-preserving)
- Transfer learning from public datasets

### 1.3 Category Constraints

**Current:** 6 hardcoded categories
```
['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Other']
```

**Challenges:**
- Limited granularity (no "Healthcare", "Travel", "Subscriptions")
- "Other" becomes catch-all bucket
- No custom user categories

**Recommendation:** Consider expanding to 10-12 categories or allowing custom categories with ML mapping to parent categories.

### 1.4 Feature Extraction from Unstructured Text

**Primary Feature:** `expense.description` field

**Examples of real input variations:**
- `"Starbucks coffee"`
- `"AMZN*Marketplace Seattle WA"`
- `"gas station"`
- `"groceries"`
- `"dinner with friends"`

**Challenges:**
- No consistent format (bank import vs manual entry)
- Abbreviations and variations
- Mixed case, special characters
- Multiple merchants in one description

**Text Processing Pipeline Required:**
1. Lowercase normalization
2. Special character cleanup
3. Merchant name extraction
4. Keyword tokenization
5. N-gram generation for compound terms

### 1.5 Model Performance vs Size Tradeoff

**Constraint:** Must feel instant (<100ms suggestion latency)

| Model Type | Accuracy | Latency | Size |
|------------|----------|---------|------|
| Keyword rules | 60-70% | <5ms | <10KB |
| Naive Bayes | 75-85% | <10ms | <100KB |
| TF-IDF + LogReg | 80-88% | <20ms | <500KB |
| Neural Network | 85-92% | 50-100ms | 1-5MB |
| Transformer (tiny) | 88-95% | 100-200ms | 5-20MB |

**Recommendation:** Start with Naive Bayes, upgrade to Neural as data grows

### 1.6 Concept Drift

User behavior changes over time:
- New merchants/services emerge
- Personal categorization preferences evolve
- Seasonal spending patterns

**Solution:** Continuous learning with rolling window (last 6 months weighted)

---

## 2. Data Collection Requirements

### 2.1 Required Data Points for ML

**MUST HAVE** (for basic classification):
- `description: string` — Primary feature
- `category: string` — Label
- `amount: number` — Secondary feature
- `date: string` — Temporal patterns

**SHOULD HAVE** (for improved accuracy):
- `userConfirmedCategory: boolean` — Did user accept suggestion?
- `originalSuggestion: string` — What ML predicted
- `confidenceScore: number` — Model certainty
- `vendor: string` — Extracted merchant name

**NICE TO HAVE** (for advanced features):
- `location: {lat, lng}` — Geo patterns
- `paymentMethod: string` — Card-specific patterns
- `isRecurring: boolean` — Subscription detection
- `tags: string[]` — User-defined subtags

### 2.2 Proposed Extended Data Model

```typescript
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
```

**Amount Buckets:**
- micro: $0-10
- small: $10-50
- medium: $50-150
- large: $150-500
- xlarge: $500+

### 2.3 Training Data Collection Strategy

**Phase 1: Bootstrap with Rules**
- Parse existing localStorage expenses
- Apply keyword rules to generate pseudo-labels
- Build initial vocabulary

**Phase 2: Active Learning**
- Show ML suggestion alongside manual selection
- Track when user overrides suggestion
- Weight corrections higher in training

**Phase 3: Feedback Loop Schema**

```sql
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
```

### 2.4 Minimum Viable Training Set

For personalized model to be effective:
- **Minimum:** 50 expenses per category
- **Good:** 100+ expenses per category
- **Excellent:** 500+ expenses total

**Cold Start Mitigation:**
- Pre-train on public expense datasets
- Use generic keyword dictionary
- Confidence threshold: Only suggest when >70% confident

---

## 3. ML Approaches & Recommendations

### 3.1 Approach Comparison Matrix

| Approach | Complexity | Accuracy | Data Needed | Interpretable |
|----------|------------|----------|-------------|---------------|
| Keyword Matching | Low | 60-70% | None | Yes |
| Naive Bayes | Low | 75-85% | 200+ | Yes |
| TF-IDF + SVM | Medium | 80-88% | 500+ | Partial |
| Random Forest | Medium | 82-88% | 500+ | Partial |
| Neural Network | High | 85-92% | 1000+ | No |
| Fine-tuned LLM | Very High | 90-95% | 100+ | Partial |

### 3.2 Recommended Architecture: Tiered Approach

**TIER 1: Rule-Based System** (Always available)
- Runs client-side, zero latency
- Keyword dictionaries for common merchants
- Regex patterns for bank transaction formats
- Returns category + confidence

Example Rules:
```
/starbucks|dunkin|coffee/i        → Food (0.95)
/uber|lyft|taxi/i                 → Transportation (0.95)
/netflix|spotify|hulu/i           → Entertainment (0.90)
/amazon|walmart|target/i          → Shopping (0.70)
/electric|water|internet|phone/i  → Bills (0.85)
```

**TIER 2: Statistical Model** (When enough data)
- Naive Bayes classifier
- Trained on user's historical data
- Bag-of-words + amount features
- Runs server-side via API

**TIER 3: Neural Network** (Future enhancement)
- Character-level CNN or small transformer
- Handles typos and variations
- Only activate after 1000+ expenses

### 3.3 Feature Engineering Pipeline

**Input:** `"AMZN*Marketplace Seattle 12.99"`

```
Step 1: Preprocessing
  → "amzn marketplace seattle 12.99"

Step 2: Token Extraction
  → ["amzn", "marketplace", "seattle"]

Step 3: Merchant Detection
  → vendor: "amazon" (from alias dictionary)

Step 4: Feature Vector Construction
  → {
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
```

### 3.4 Naive Bayes Implementation Sketch

```typescript
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
```

### 3.5 Hybrid Decision Logic

```typescript
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
```

---

## 4. Privacy & Data Security

### 4.1 Data Sensitivity Classification

| Level | Data Types |
|-------|------------|
| **HIGH** | Expense descriptions, spending patterns, location data |
| **MEDIUM** | Category distributions, aggregate amounts, temporal patterns |
| **LOW** | Anonymous keyword frequencies, category priors |

### 4.2 Local-First Architecture (Recommended)

**Principle:** All personal expense data stays on user's device

```
┌─────────────────────────────────────────────────────┐
│                    USER DEVICE                       │
│                                                      │
│  Raw Expense Data  ──▶  ML Model (Local)            │
│         │                     ▲                      │
│         ▼                     │ Download             │
│  Training (Local)  ──▶  Model Updates               │
│                                                      │
└─────────────────────────────────────────────────────┘
                          │
            Optional: Federated Learning
                          ▼
                 ┌─────────────────┐
                 │ Server          │
                 │ (Gradients only,│
                 │ not raw data)   │
                 └─────────────────┘
```

### 4.3 If Using Server-Side Processing

**A) In Transit:**
- TLS 1.3 for all API calls
- Certificate pinning for mobile apps
- Request signing to prevent tampering

**B) At Rest:**
- Encrypt expense data with user-specific keys
- No plaintext storage of descriptions
- Separate encryption for PII fields

**C) Processing:**
- Stateless inference (no logging of inputs)
- Memory cleared after prediction
- No training on server without consent

### 4.4 Privacy-Preserving ML Options

| Option | Description | Trade-offs |
|--------|-------------|------------|
| On-Device Only | Model trains/runs entirely in browser | Limited compute, no sync |
| Federated Learning | Share only model updates, not data | Complex infrastructure |
| Privacy-Preserving Features | Hash/tokenize before sending to server | Reduced accuracy |

### 4.5 Compliance Considerations

**GDPR (if EU users):**
- Right to explanation (interpretable models preferred)
- Right to deletion (must support model unlearning)
- Data portability (export user's training data)
- Consent required for processing

**CCPA (if California users):**
- Opt-out of "sale" of data
- Disclosure of data categories collected

**Recommendation:** Implement consent UI before ML features

### 4.6 Data Retention Policy

| Data Type | Retention |
|-----------|-----------|
| Raw Expense Data | Indefinite (user-controlled localStorage) |
| ML Training Data | Rolling 12-month window |
| Model Weights | Until new model trained |
| Feedback Data | 90 days, then aggregated only |
| Deleted Expenses | Immediate removal, retrain on next cycle |

---

## 5. User Experience Flow

### 5.1 Suggestion Display States

**State A: High Confidence (>85%)**
```
┌────────────────────────────────────────┐
│ Category: [Food] Auto-suggested        │
│                                        │
│ Based on "Starbucks" → Food (95%)      │
│                                        │
│ [Accept]  [Change Category ▼]          │
└────────────────────────────────────────┘
```

**State B: Medium Confidence (60-85%)**
```
┌────────────────────────────────────────┐
│ Suggested: [Shopping?]                 │
│                                        │
│ Or select: [Food] [Transport] [Other]  │
│                                        │
│ "Amazon purchase" could be several     │
└────────────────────────────────────────┘
```

**State C: Low Confidence (<60%)**
```
┌────────────────────────────────────────┐
│ Select category:                       │
│                                        │
│ [Food] [Transport] [Entertainment]     │
│ [Shopping] [Bills] [Other]             │
│                                        │
│ We'll learn your preferences!          │
└────────────────────────────────────────┘
```

### 5.2 Inline Suggestion Interaction

**On Description Input** (debounced 300ms):
1. User types "uber ride to airport"
2. Show typing indicator under category buttons
3. ML returns `{Transportation, 0.92}`
4. Animate highlight on Transportation button
5. Show small "Suggested" badge

**On Category Selection:**
- If matches suggestion: Record as accepted
- If differs: Record as correction, animate feedback
- Show brief "Got it! I'll remember that." toast

### 5.3 Bulk Import Flow

```
┌────────────────────────────────────────────────────┐
│ Importing 47 expenses...                           │
│                                                    │
│ Auto-categorized: 38 (81%)                         │
│ ████████████████████░░░░░░                         │
│                                                    │
│ Need your help with 9 expenses:                    │
│                                                    │
│ ┌──────────────────────────────────────────────┐   │
│ │ WHOLEFDS MKT #123     $67.23                 │   │
│ │ [Food?] [Shopping] [Other]                   │   │
│ └──────────────────────────────────────────────┘   │
│                                                    │
│ [Skip] [Apply to Similar]                          │
└────────────────────────────────────────────────────┘
```

### 5.4 Settings & Control

```
┌────────────────────────────────────────┐
│ Smart Categories                       │
│ ─────────────────────────────────────  │
│                                        │
│ Auto-categorization         [ON]       │
│                                        │
│ Suggestion threshold     [███░░] 70%   │
│ (Only suggest above this confidence)   │
│                                        │
│ Learning mode           [Balanced ▼]   │
│  • Conservative (more manual picks)    │
│  • Balanced                            │
│  • Aggressive (more auto-categorize)   │
│                                        │
│ [View Learning Stats]                  │
│ [Reset Learning Data]                  │
└────────────────────────────────────────┘
```

### 5.5 Feedback & Correction Flow

**Subtle Feedback** (default):
- Category changes with brief animation
- Small "Learned!" indicator fades in/out

**Detailed Feedback** (in settings):
- "Changed from Shopping to Bills"
- "Future 'netflix' expenses → Bills"

**Batch Correction Prompt** (when pattern detected):
> "You've categorized 3 'Netflix' expenses as Bills.
> Apply to 5 similar past expenses?"
> `[Yes, Update All]` `[No, Just This One]`

### 5.6 Onboarding for ML Features

**First-Time User Flow:**
1. Normal expense creation (no ML yet)
2. After 10 expenses: "Enable Smart Categories?"
3. Show benefit: "Save time with auto-suggestions"
4. Explain: "Learns from your choices, all on-device"
5. Optional: Import bank data to bootstrap

**Returning User** (existing data):
1. Analyze existing expenses
2. "Found 150 expenses. Train your personal model?"
3. Show accuracy preview on sample
4. Enable if accuracy > 75%

---

## 6. Edge Cases & Error Handling

### 6.1 Cold Start Scenarios

| Scenario | Solution |
|----------|----------|
| Brand new user, 0 expenses | Disable ML, use keyword rules only, show "Learning..." state |
| User with data but new category | Fallback to keyword matching, actively prompt for examples |
| User with skewed data (90% Food) | Apply class balancing/weighting, track per-category accuracy |

### 6.2 Ambiguous Inputs

**Input: "Amazon"**
- Problem: Could be Food (Fresh), Shopping, Entertainment (Prime)
- Solution: Show multiple suggestions, check historical pattern, use amount ($14.99 likely Prime, $150 likely Shopping)

**Input: "ATM Withdrawal"**
- Problem: Actual use unknown
- Solution: Mark as "Uncategorizable", don't use for training, prompt user

**Input: "" (empty)**
- Problem: No features to analyze
- Solution: Don't suggest, require manual selection, flag as low-quality

### 6.3 Model Failures

| Scenario | Guard | Fallback |
|----------|-------|----------|
| Invalid category returned | Validate against EXPENSE_CATEGORIES | Return 'Other' with 0 confidence |
| Inference timeout (>500ms) | Set 300ms timeout | Show category picker immediately |
| Model file corrupted | Checksum validation on load | Re-download or use rules only |
| TensorFlow.js fails to load | Try-catch initialization | Feature detection, rule-based only |

### 6.4 Data Quality Issues

| Issue | Detection | Handling |
|-------|-----------|----------|
| Garbage/random text | Entropy analysis | Exclude from training |
| Inconsistent categorization | Same description, different categories | Use most recent preference |
| Very short descriptions (<3 chars) | Length check | Lower confidence ceiling (max 60%) |
| Very long descriptions (>500 chars) | Length check | Truncate to first 100 chars |

### 6.5 Adversarial Scenarios

**User tries to "game" the system:**
- Detection: Anomaly scoring
- Handling: Require threshold of consistent data

**Imported data from compromised source:**
- Handling: Strict input sanitization, limit import batch size

### 6.6 Error Message Guidelines

| Internal Error | User-Facing Message |
|----------------|---------------------|
| "NaN confidence score in prediction pipeline" | "Couldn't suggest a category. Please select one." |
| "Model training failed: insufficient data points" | "Need a few more expenses to learn your preferences" |
| "TensorFlow WASM backend initialization error" | "Smart categories temporarily unavailable" |

**Logging (for debugging):**
- Log all prediction failures with context
- Track suggestion acceptance rate over time
- Alert if accuracy drops below threshold

---

## 7. Deployment & Maintenance Strategy

### 7.1 Deployment Options

| Option | Pros | Cons |
|--------|------|------|
| **A) Full Client-Side** | No backend changes, works offline, zero server costs, full privacy | Larger bundle (~3MB), slower load, no cross-device |
| **B) Hybrid** (Recommended) | Small client bundle, cross-device sync, upgradeable models | Requires API routes, server costs, latency |
| **C) Full Server-Side** | Most powerful models, no client impact | Requires database, privacy concerns, no offline |

### 7.2 Recommended Deployment Architecture

```
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
```

**For localStorage-only** (current architecture):
- Deploy TensorFlow.js Lite model
- Store model in IndexedDB
- Train/retrain client-side
- No API routes needed

### 7.3 Model Versioning Strategy

**Version Schema:** `major.minor.patch-dataset`
**Example:** `v2.1.0-2025Q1`

| Component | Meaning |
|-----------|---------|
| Major | Architecture change (e.g., Naive Bayes → Neural) |
| Minor | Retraining with significant data additions |
| Patch | Bug fixes, small improvements |
| Dataset | Training data snapshot identifier |

**Model Registry:**
```
/models/
  /v1.0.0/
    model.json
    weights.bin
    metadata.json
  /v2.0.0/
    model.onnx
    metadata.json
```

**Rollback Strategy:**
- Keep last 3 versions deployed
- Feature flag to switch versions
- Automatic rollback if accuracy drops >10%

### 7.4 Monitoring & Observability

**Prediction Quality:**
- Suggestion acceptance rate (target: >70%)
- Correction rate per category
- Mean confidence score
- Accuracy vs confidence calibration

**Performance:**
- P50/P95/P99 prediction latency
- Model load time
- Memory usage (browser)
- Bundle size impact

**User Engagement:**
- % users with ML enabled
- Time saved (manual selection vs suggestion)
- Feature adoption over time

**Dashboard Alerts:**
- Acceptance rate drops below 60%
- P99 latency exceeds 200ms
- Error rate exceeds 1%
- Model size exceeds budget

### 7.5 Continuous Improvement Pipeline

| Cadence | Actions |
|---------|---------|
| Weekly | Review accuracy by category, identify top miscategorized merchants, update keyword rules |
| Monthly | Retrain global model, A/B test improvements, review user feedback |
| Quarterly | Evaluate new architectures, expand taxonomy if needed, major version release |

### 7.6 A/B Testing Framework

**Test Types:**
1. Model comparison (v1 vs v2)
2. Threshold testing (70% vs 80% confidence)
3. UX variants (inline vs modal suggestions)

**Implementation:**
- Hash user ID to assign bucket
- Store experiment assignment in localStorage
- Track metrics separately per variant
- Statistical significance: p < 0.05

### 7.7 Disaster Recovery

**Scenario: Model completely broken**
1. Feature flag: Disable ML suggestions globally
2. Users see manual category picker
3. Deploy fixed model
4. Gradually re-enable with monitoring

**Scenario: Data corruption**
1. localStorage clear detection
2. Re-download model from CDN
3. Cold start experience (no personalization)
4. User prompted to re-train

---

## 8. Implementation Phases

### Phase 1: Foundation

**Goals:**
- Extend data model for ML fields
- Build text preprocessing pipeline
- Implement keyword rule system

**Deliverables:**
- [ ] Update Expense type with ML fields
- [ ] Create `normalizeDescription()` utility
- [ ] Build keyword → category rule dictionary (100+ rules)
- [ ] Add `extractVendor()` function
- [ ] Unit tests for text processing

**Files to Modify:**
- `src/types/expense.ts`
- `src/lib/utils.ts` (add `ml-utils.ts`)
- `src/context/ExpenseContext.tsx`

### Phase 2: Rule-Based Suggestions

**Goals:**
- Implement client-side suggestion engine
- Add UI for displaying suggestions
- Track suggestion acceptance

**Deliverables:**
- [ ] `KeywordCategorizer` class
- [ ] Suggestion display in ExpenseForm
- [ ] Acceptance/correction tracking
- [ ] Settings toggle for feature

**Files to Create/Modify:**
- `src/lib/categorizer/keyword-rules.ts`
- `src/components/ExpenseForm.tsx`
- `src/components/CategorySuggestion.tsx`

### Phase 3: Naive Bayes Model

**Goals:**
- Implement trainable Naive Bayes classifier
- Add training pipeline
- Integrate with suggestion UI

**Deliverables:**
- [ ] `NaiveBayesCategorizer` class
- [ ] Training data extraction from history
- [ ] Model serialization to localStorage
- [ ] Hybrid rule + ML suggestion logic

**Files to Create:**
- `src/lib/categorizer/naive-bayes.ts`
- `src/lib/categorizer/trainer.ts`
- `src/lib/categorizer/index.ts`

### Phase 4: Feedback Loop

**Goals:**
- Implement continuous learning
- Add accuracy monitoring
- Build settings/stats UI

**Deliverables:**
- [ ] Feedback collection system
- [ ] Incremental model updates
- [ ] Learning statistics page
- [ ] Reset/retrain controls

**Files to Create/Modify:**
- `src/app/settings/ml/page.tsx`
- `src/components/LearningStats.tsx`

### Phase 5: Optimization

**Goals:**
- Optimize performance
- Polish UX
- Comprehensive testing

**Deliverables:**
- [ ] Bundle size optimization
- [ ] Latency improvements
- [ ] Edge case handling
- [ ] Integration tests
- [ ] User documentation

### Future Phases

- **Phase 6:** Server-Side ML API (if scaling needed)
- **Phase 7:** Neural Network Upgrade (if accuracy plateau)
- **Phase 8:** Federated Learning (if multi-user product)

---

## Appendix A: Keyword Rules Starter Set

```typescript
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
```

---

## Appendix B: Accuracy Targets

| Phase | Overall Accuracy | High-Confidence Accuracy | Coverage |
|-------|------------------|--------------------------|----------|
| Phase 2 (Rules Only) | 60-70% | 95%+ | 40% |
| Phase 3 (Rules + Naive Bayes) | 75-85% | 90%+ | 70% |
| Phase 5 (Optimized) | 80-88% | 92%+ | 85% |
| Future (Neural) | 88-95% | 95%+ | 95% |
