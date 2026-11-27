// The clock, behind one function.
//
// Two constraints collide here. Next's cacheComponents rejects a bare Date.now() during prerender,
// and the React lint rules reject Date.now() called during render. Both are right: the value must be
// taken once per request, in a server component, after `await connection()`. Putting it behind a
// single function means there is exactly one place the impurity lives, instead of a rule disabled in
// two files.
export const requestClock = (): number => Date.now();
