import { ExpressionsCompiler } from '../src/compiler';
import { PascalCompiler } from '../src/compiler';
  
describe('PascalCompiler - Полное покрытие', () => {
  describe('проверка компилятора матесатических выражений', () => {
    const compiler = new ExpressionsCompiler();
    
    test('+', () => {
      expect(compiler.eval("2 * 2 / 3 + 4 + 2 - 5")).toBe(2);
    });

    test('just number', () => {
      expect(compiler.eval("2")).toBe(2);
    });

    test('just <0 number', () => {
      expect(compiler.eval("-2")).toBe(-2);
    });

    test('pars', () => {
      expect(compiler.eval("-(2+2)*2")).toBe(-8);
    });

    test('unexp', () => {
      try{
        compiler.eval("-(2+2e)*2")
        expect(false).toBe(true);
      } catch {
        expect(true).toBe(true);
      }
    });

    test('not closed (', () => {
      try{
        compiler.eval("-(2+2*2")
        expect(false).toBe(true);
      } catch {
        expect(true).toBe(true);
      }
    });

    test('zero div', () => {
      try{
        compiler.eval("20/0")
        expect(false).toBe(true);
      } catch {
        expect(true).toBe(true);
      }
    });

    test('undefined', () => {
      try{
        compiler.eval("")
        expect(false).toBe(true);
      } catch {
        expect(true).toBe(true);
      }
    });

    test('unexp', () => {
      try{
        compiler.eval("-+2")
        expect(false).toBe(true);
      } catch {
        expect(true).toBe(true);
      }
    });

    test('unexp', () => {
      try{
        compiler.eval("2+")
        expect(false).toBe(true);
      } catch {
        expect(true).toBe(true);
      }
    });
  });

  describe('проверка компилятора паскаля', () => {
      let compiler = new PascalCompiler();

      test('pr1', () => {
        let program: string = 
          `BEGIN
          END.`;
          expect(compiler.run(program).keys.length).toBe(0);
      });  


      test('pr2', () => {
        let program: string = 
          `BEGIN
                  x:= 2 + 3 * (2 + 3);
                  y:= 2 / 2 - 2 + 3 * ((1 + 1) + (1 + 1));
           END.`;
          expect(compiler.run(program).get('x')).toBe(17);
          expect(compiler.run(program).get('y')).toBe(11);
      });  

      test('pr3', () => {
        let program: string = 
          `BEGIN
              y: = 2;
              BEGIN
                  a := 3;
                  a := a;
                  b := 10 + a + 10 * y / 4;
                  c := a - b
              END;
              x := 11;
           END.`;
          expect(compiler.run(program).get('x')).toBe(11);
          expect(compiler.run(program).get('y')).toBe(2);
          expect(compiler.run(program).get('a')).toBe(3);
          expect(compiler.run(program).get('b')).toBe(18);
          expect(compiler.run(program).get('c')).toBe(-15);
      });  

      test('smth', () => {
        let program: string = 
          `BEGIN
              y: = 2;asdasds
              BEGIN
                  a := 3;
                  a := a;
                  b := 10 + a + 10 * y / 4;
                  c := a - b
              END;
              x := 11;
           END.`;
          try{
            compiler.run(program);
            expect(false).toBe(true);
          } catch {
            expect(true).toBe(true);
          }
      });  

      test('no begin', () => {
        let program: string = 
          `
              y: = 2;asdasds
              BEGIN
                  a := 3;
                  a := a;
                  b := 10 + a + 10 * y / 4;
                  c := a - b
              END;
              x := 11;
           END.`;
          try{
            compiler.run(program);
            expect(false).toBe(true);
          } catch {
            expect(true).toBe(true);
          }
      });  

      test('no end', () => {
        let program: string = 
          `BEGIN
              y: = 2;asdasds
              BEGIN
                  a := 3;
                  a := a;
                  b := 10 + a + 10 * y / 4;
                  c := a - b
              END;
              x := 11;
           `;
          try{
            compiler.run(program);
            expect(false).toBe(true);
          } catch {
            expect(true).toBe(true);
          }
      });  

      test('no end ; ', () => {
        let program: string = 
          `BEGIN
              y: = 2;asdasds
              BEGIN
                  a := 3;
                  a := a;
                  b := 10 + a + 10 * y / 4;
                  c := a - b;
              
              x := 11;
              END.
           `;
          try{
            compiler.run(program);
            expect(false).toBe(true);
          } catch {
            expect(true).toBe(true);
          }
      });  

      test('undefined ', () => {
        let program: string = 
          `~BEGIN
              y: = 2;asdasds
              BEGIN
                  a := o + p;
                  a := a;
                  b := 10 + a + 10 * y / 4;
                  c := a - b
              
              x := 11
           `;
          try{
            compiler.run(program);
            expect(false).toBe(true);
          } catch {
            expect(true).toBe(true);
          }
      });  

      test('undefined ', () => {
        let program: string = 
          `BEGIN
              y: = K +22;
              BEGIN
                  a := o + p;
                  a := a;
                  b := 10 + a + 10 * y / 4;
                  c := a - b
              
              x := 11
           `;
          try{
            compiler.run(program);
            expect(false).toBe(true);
          } catch {
            expect(true).toBe(true);
          }
      });  


      test('unexpected', () => {
        let program: string = 
          `BEGIN
                 ;
                 ;
           END.`;
          try{
            compiler.run(program);
            expect(false).toBe(true);
          } catch {
            expect(true).toBe(true);
          }
      });  

      test('unexpected', () => {
        let program: string = 
          `BEGIN
                 `;
          try{
            compiler.run(program);
            expect(false).toBe(true);
          } catch {
            expect(true).toBe(true);
          }
      });  

      test('unexpected', () => {
        let program: string = 
          `BEGIN
                 `;
          try{
            compiler.run(program);
            expect(false).toBe(true);
          } catch {
            expect(true).toBe(true);
          }
      });  

      test('begin;', () => {
        let program: string = 
          `BEGIN
              y: = 2;
              BEGIN
                  a := 3;
                  a := a;
                  b := 10 + a + 10 * y / 4;
                  c := a - b
              END;
              x := 11;
           END.`;
          expect(compiler.run(program).get('x')).toBe(11);
          expect(compiler.run(program).get('y')).toBe(2);
          expect(compiler.run(program).get('a')).toBe(3);
          expect(compiler.run(program).get('b')).toBe(18);
          expect(compiler.run(program).get('c')).toBe(-15);
      });  
    })
});