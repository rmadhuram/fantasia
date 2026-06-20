// Minimal recursive-descent parser/evaluator for math expressions in x and z.
// Deliberately not `eval`/`new Function` — keeps evaluation to a small,
// well-defined grammar instead of running arbitrary JS.

type TokenType = "number" | "ident" | "op" | "lparen" | "rparen" | "comma";

interface Token {
  type: TokenType;
  value: string;
}

const FUNCTIONS: Record<string, (...args: number[]) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  sqrt: Math.sqrt,
  abs: Math.abs,
  exp: Math.exp,
  log: Math.log,
  floor: Math.floor,
  ceil: Math.ceil,
  pow: Math.pow,
  min: Math.min,
  max: Math.max,
  hypot: Math.hypot,
};

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
};

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < source.length) {
    const c = source[i];
    if (/\s/.test(c)) {
      i++;
    } else if (/[0-9.]/.test(c)) {
      let j = i + 1;
      while (j < source.length && /[0-9.]/.test(source[j])) j++;
      tokens.push({ type: "number", value: source.slice(i, j) });
      i = j;
    } else if (/[a-zA-Z_]/.test(c)) {
      let j = i + 1;
      while (j < source.length && /[a-zA-Z0-9_]/.test(source[j])) j++;
      tokens.push({ type: "ident", value: source.slice(i, j) });
      i = j;
    } else if (c === "(") {
      tokens.push({ type: "lparen", value: c });
      i++;
    } else if (c === ")") {
      tokens.push({ type: "rparen", value: c });
      i++;
    } else if (c === ",") {
      tokens.push({ type: "comma", value: c });
      i++;
    } else if ("+-*/^".includes(c)) {
      tokens.push({ type: "op", value: c });
      i++;
    } else {
      throw new Error(`Unexpected character "${c}"`);
    }
  }
  return tokens;
}

type Node =
  | { kind: "number"; value: number }
  | { kind: "var"; name: "x" | "z" }
  | { kind: "const"; value: number }
  | { kind: "call"; name: string; args: Node[] }
  | { kind: "unary"; op: "+" | "-"; operand: Node }
  | { kind: "binary"; op: "+" | "-" | "*" | "/" | "^"; left: Node; right: Node };

class Parser {
  private pos = 0;
  constructor(private tokens: Token[]) {}

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private consume(type?: TokenType): Token {
    const token = this.tokens[this.pos];
    if (!token || (type && token.type !== type)) {
      throw new Error(`Unexpected token near position ${this.pos}`);
    }
    this.pos++;
    return token;
  }

  parse(): Node {
    const node = this.parseExpression();
    if (this.pos !== this.tokens.length) {
      throw new Error("Unexpected trailing input");
    }
    return node;
  }

  private parseExpression(): Node {
    let node = this.parseTerm();
    while (this.peek()?.type === "op" && (this.peek()!.value === "+" || this.peek()!.value === "-")) {
      const op = this.consume().value as "+" | "-";
      node = { kind: "binary", op, left: node, right: this.parseTerm() };
    }
    return node;
  }

  private parseTerm(): Node {
    let node = this.parsePower();
    while (this.peek()?.type === "op" && (this.peek()!.value === "*" || this.peek()!.value === "/")) {
      const op = this.consume().value as "*" | "/";
      node = { kind: "binary", op, left: node, right: this.parsePower() };
    }
    return node;
  }

  private parsePower(): Node {
    const node = this.parseUnary();
    if (this.peek()?.type === "op" && this.peek()!.value === "^") {
      this.consume();
      return { kind: "binary", op: "^", left: node, right: this.parsePower() };
    }
    return node;
  }

  private parseUnary(): Node {
    const token = this.peek();
    if (token?.type === "op" && (token.value === "+" || token.value === "-")) {
      this.consume();
      return { kind: "unary", op: token.value as "+" | "-", operand: this.parseUnary() };
    }
    return this.parsePrimary();
  }

  private parsePrimary(): Node {
    const token = this.peek();
    if (!token) throw new Error("Unexpected end of expression");

    if (token.type === "number") {
      this.consume();
      return { kind: "number", value: Number(token.value) };
    }

    if (token.type === "lparen") {
      this.consume();
      const node = this.parseExpression();
      this.consume("rparen");
      return node;
    }

    if (token.type === "ident") {
      this.consume();
      const name = token.value.toLowerCase();

      if (this.peek()?.type === "lparen") {
        this.consume();
        const args: Node[] = [];
        if (this.peek()?.type !== "rparen") {
          args.push(this.parseExpression());
          while (this.peek()?.type === "comma") {
            this.consume();
            args.push(this.parseExpression());
          }
        }
        this.consume("rparen");
        if (!(name in FUNCTIONS)) throw new Error(`Unknown function "${name}"`);
        return { kind: "call", name, args };
      }

      if (name === "x" || name === "z") return { kind: "var", name };
      if (name in CONSTANTS) return { kind: "const", value: CONSTANTS[name] };
      throw new Error(`Unknown identifier "${name}"`);
    }

    throw new Error(`Unexpected token "${token.value}"`);
  }
}

function evaluate(node: Node, x: number, z: number): number {
  switch (node.kind) {
    case "number":
      return node.value;
    case "const":
      return node.value;
    case "var":
      return node.name === "x" ? x : z;
    case "unary": {
      const v = evaluate(node.operand, x, z);
      return node.op === "-" ? -v : v;
    }
    case "binary": {
      const l = evaluate(node.left, x, z);
      const r = evaluate(node.right, x, z);
      switch (node.op) {
        case "+":
          return l + r;
        case "-":
          return l - r;
        case "*":
          return l * r;
        case "/":
          return l / r;
        case "^":
          return Math.pow(l, r);
      }
      break;
    }
    case "call": {
      const args = node.args.map((a) => evaluate(a, x, z));
      return FUNCTIONS[node.name](...args);
    }
  }
}

export type CompiledExpr = (x: number, z: number) => number;

// Throws on invalid syntax; the returned function may still produce NaN/Infinity
// for inputs outside the function's domain (e.g. sqrt of a negative number).
export function compileExpression(source: string): CompiledExpr {
  const ast = new Parser(tokenize(source)).parse();
  return (x: number, z: number) => evaluate(ast, x, z);
}
