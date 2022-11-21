export const isValidParenthesis = (s: string): boolean => {
  const map: Record<string, string> = {
    '}': '{',
    ']': '[',
    ')': '(',
  };

  const chars: Record<string, boolean> = {
    '}': true,
    ']': true,
    ')': true,
    '{': true,
    '[': true,
    '(': true,
  };

  const stack = [];

  for (let i = 0; i < s.length; i++) {
    if (!chars[s[i]]) {
      continue;
    }

    if (stack.length > 0 && stack[stack.length - 1] === map[s[i]]) {
      stack.pop();
      continue;
    }

    stack.push(s[i]);
  }

  return stack.length === 0;
};
