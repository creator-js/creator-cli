export const isValidParenthesis = (s: string): boolean => {

  if (!s) return true;
  
  const chars: Record<string, boolean> = {
    '{': true,
    '}': true,
    '[': true,
    ']': true,
    '(': true,
    ')': true,
  };
  
  const map: Record<string, string> = {
    '}': '{',
    ']': '[',
    ')': '(',
  };

  const stack: string[] = [];
  
  const len = s.length;
  
  if (len % 2 !== 0) return false;

  for (let i = 0; i < len; i++) {
    const char = s[i];
    
    if (!chars[char]) continue;
    
    if (map[char]) {
      if (!stack.length || stack.pop() !== map[char]) {
        return false;
      }
      continue;
    }
    
    stack.push(char);
  }

  return stack.length === 0;
};
