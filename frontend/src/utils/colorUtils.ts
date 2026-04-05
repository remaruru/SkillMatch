export function getMatchColor(score: number): string {
    if (score >= 100) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-orange-600 bg-orange-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    if (score >= 25) return 'text-blue-600 bg-blue-100';
    return 'text-red-600 bg-red-100';
}
