# Skill Evaluation Report: tech-stack-analyzer

**Evaluation Date:** 3/14/2026
**Framework Version:** 1.0.0
**Test Cases:** 8
**Total Trials:** 2

## Executive Summary

- **Success Rate:** 0.0%
- **Trigger Accuracy:** 100.0%
- **Qualitative Score:** 30.0%
- **Deterministic Compliance:** 100.0%

## Analysis

### Strengths

- ✅ Precise trigger detection - minimal false positives/negatives
- ✅ Excellent adherence to deterministic requirements

### Weaknesses

- ❌ Low success rate requires immediate attention

### Improvement Areas

- 🔧 Output quality needs improvement

## Recommendations

### Immediate Actions (Critical)

- 🚨 Address critical failures - review error handling and edge cases

### Short-term Improvements

- 📋 Improve output quality through better prompts and validation

### Long-term Strategy

- 🎯 Implement comprehensive test coverage for edge cases
- 🎯 Add automated regression testing to prevent future issues
- 🎯 Consider skill refactoring based on usage patterns

## Visualizations

### Success Rate by Test Case

```
Success Rate by Test Case:
==================================================
tsa-positive-react-typescript ████████████████████ 100%
tsa-negative-irrelevant-task ████████████████████ 100%

```

### Confidence Distribution

```
Confidence Level Distribution:
==============================
high     ██████████ 1 (50%)
medium    0 (0%)
low       0 (0%)

```

### Performance Metrics

```
Performance Metrics:
==============================
Average: 1000ms
Median:  1500ms
Min:     500ms
Max:     1500ms

Duration Distribution:
0-1000ms: █████████████████████████ 1
1000-2000ms: █████████████████████████ 1
2000-5000ms:  0
5000-10000ms:  0

```

## Detailed Results

| Test Case                     | Trial | Success | Triggered | Duration | Score |
| ----------------------------- | ----- | ------- | --------- | -------- | ----- |
| tsa-positive-react-typescript | 1     | ✅      | ✅        | 1500ms   | 90%   |
| tsa-negative-irrelevant-task  | 1     | ✅      | ❌        | 500ms    | N/A   |
