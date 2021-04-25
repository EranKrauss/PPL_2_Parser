import { reduce, map } from 'ramda';
import { AppExp, CExp, DefineExp, Exp, IfExp, isAppExp, isAtomicExp, isBoolExp, isCExp, isDefineExp, isIfExp, isLetExp, isNumExp, isPrimOp, isProcExp, isProgram, isStrExp, isVarRef, LetExp, PrimOp, ProcExp, Program } from '../imp/L3-ast';
import { Result, makeFailure, makeOk, mapResult } from '../shared/result';
import { isBoolean } from '../shared/type-predicates';
import { makeClassExp } from './L31-ast';

/*
Purpose: Transform L2 AST to Python program string
Signature: l2ToPython(l2AST)
Type: [EXP | Program] => Result<string>
*/


export const convertProgToPython = (exp: Program): string => {
    let ans =  reduce((acc, curr) => {
        return acc.concat(`${isDefineExp(curr)? l2ToPythonHelper(curr) : l2ToPythonHelper(curr)}\n`)
    } , "", exp.exps)
    return (ans.substr(0, ans.length - 1))
}


export const convertIfExp = (exp: IfExp):string => {
    return `(${l2ToPythonHelper(exp.then)} if ${l2ToPythonHelper(exp.test)} else ${l2ToPythonHelper(exp.alt)})`
}

export const convertProcExp = (exp: ProcExp):string => {
    return `(lambda ${reduce( (acc, curr) => {return acc.concat(`,${curr.var}`)} , "" , exp.args).substr(1)} : ${l2ToPythonHelper(exp.body[0])})`
}
    
export const convertDefineToPython = (exp: DefineExp): string => {return `${exp.var.var} = ${l2ToPythonHelper(exp.val)}` }

export const convertAppToPython = (rator: Exp, rands: Exp[]): string =>{
    return isPrimOp(rator) ? 
        //primOp
         (rator.op === "or" ?     `(${map(l2ToPythonHelper, rands).join(" || ")})` 
        : rator.op === "and" ?  `(${map(l2ToPythonHelper, rands).join(" && ")})` 
        : rator.op === "not" ?  `(not ${l2ToPythonHelper(rands[0])})`
        : rator.op === "boolean?" ?   `(lambda x : (type(x) == bool)(${l2ToPythonHelper(rands[0])})`
        : rator.op === "number?" ?  `(lambda x : (type(x) == number)(${l2ToPythonHelper(rands[0])})`
        : rator.op === "eq?" || rator.op === "="  ?  `(${l2ToPythonHelper(rands[0])} == ${l2ToPythonHelper(rands[1])})`
        : "(".concat(map(l2ToPythonHelper, rands).join(` ${l2ToPythonHelper(rator)} `)).concat(")"))
        : `${l2ToPythonHelper(rator)}(${map(l2ToPythonHelper, rands).join(",")})`

}



export const l2ToPython = (exp: Exp | Program): Result<string>  => 
    makeOk(l2ToPythonHelper(exp));
    
export const l2ToPythonHelper = (exp: Exp | Program): string =>
    {return isBoolExp(exp)
        ? exp.val ? "true" : "false"
        : isNumExp(exp)
        ? `${exp.val}`
        : isStrExp(exp)
        ? `"${exp.val}"`
        : isVarRef(exp)
        ? exp.var
        : isProcExp(exp)
        ? convertProcExp(exp)
        : isIfExp(exp)
        ? convertIfExp(exp)
        : isAppExp(exp)
        ? convertAppToPython(exp.rator, exp.rands)
        : isPrimOp(exp)
        ? exp.op
        // : isLetExp(exp)
        // ? unparseLetExp(exp)
        : isDefineExp(exp)
        ? convertDefineToPython(exp)
        : isProgram(exp)
        ? convertProgToPython(exp)
    : ""
}