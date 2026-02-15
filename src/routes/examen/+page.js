function parseQuestionCount(param) {
	if (!param) return 20;

	const value = parseInt(param, 10);
	if (Number.isNaN(value) || value <= 0) {
		return 20;
	}

	return Math.min(value, 100);
}

export function load({ url }) {
	const searchParams = url.searchParams;

	const subject = searchParams.get('subject') ?? '';
	const questionCountParam = searchParams.get('questions');
	const useLocalParam = searchParams.get('useLocal');

	const questionCount = parseQuestionCount(questionCountParam);
	const useLocal = ['1', 'true', 'yes'].includes((useLocalParam ?? '').toLowerCase());

	return {
		subject,
		questionCount,
		useLocal
	};
}
