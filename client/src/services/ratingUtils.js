/**
 * Returns a score label, color, and background for a given numeric score.
 * @param {number|string} score - The numeric score value
 * @param {number} max - The maximum possible score (default: 10)
 * @returns {{ label: string, color: string, bg: string }}
 */
export const getRatingLabel = (score, max = 10) => {
    const normalizedToFive = (Number(score) / max) * 5;
    if (normalizedToFive >= 4.5) return { label: 'Excellent', color: '#1b5e20', bg: '#e8f5e9' };
    if (normalizedToFive >= 3.5) return { label: 'Very Good', color: '#0071c2', bg: '#e3f2fd' };
    if (normalizedToFive >= 2.5) return { label: 'Good', color: '#2e7d32', bg: '#f1f8e9' };
    if (normalizedToFive >= 1.5) return { label: 'Average', color: '#e65100', bg: '#fff3e0' };
    return { label: 'Poor', color: '#c62828', bg: '#ffebee' };
};
