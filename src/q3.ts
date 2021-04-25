import { makeLitExp, ClassExp, isClassExp, ProcExp, Exp, Program, Binding, makeAppExp, makePrimOp, CExp, makeBoolExp, makeIfExp, makeProcExp, makeVarDecl, makeVarRef, isProgram, isCExp, makeDefineExp, isDefineExp,makeProgram } from "./L31-ast";
import { Result, makeOk } from "../shared/result";
import { map } from "ramda";
import {makeSymbolSExp} from "../imp/L3-value";

/*
Purpose: Transform ClassExp to ProcExp
Signature: for2proc(classExp)`
Type: ClassExp => ProcExp
*/
export const class2proc = (exp: ClassExp): ProcExp =>
         makeProcExp(exp.fileds, [makeProcExp([makeVarDecl("msg")] , [rangeBody(exp.methods)]) ]);
    

export const rangeBody = (methods: Binding[]) : CExp=> 
    methods.length === 0 ? makeBoolExp(false) :
        makeIfExp(makeAppExp(makePrimOp('eq?'), [makeVarRef("msg"), makeLitExp(makeSymbolSExp(methods[0].var.var))]), makeAppExp(makel31Tl3Cexp(methods[0].val), []), rangeBody(methods.slice(1)));
 


/*
Purpose: Transform L31 AST to L3 AST
Signature: l31ToL3(l31AST)
Type: [Exp | Program] => Result<Exp | Program>
*/


export const L31ToL3 = (exp: Exp | Program): Result<Exp | Program> =>{
    return isProgram(exp) ? makeOk(L31ToL3Helper(exp)) : isCExp(exp) ? makeOk(makel31Tl3Cexp(exp)) : makeOk(makeDefineExp(exp.var, exp.val));
}

export const L31ToL3Helper = (exp: Program): Program => 
    makeProgram(map((x: Exp) => {return isDefineExp(x) ?  makeDefineExp(x.var, makel31Tl3Cexp(x.val)) : makel31Tl3Cexp(x)}, exp.exps ));


export const makel31Tl3Cexp = (exp: CExp): CExp=> {
    return isClassExp(exp) ? class2proc(exp) : exp;
}
