/* eslint-disable @typescript-eslint/no-unused-vars */
import * as D from 'io-ts/Decoder'
import { pipe } from 'fp-ts/function'
import { isLeft } from 'fp-ts/lib/Either'

/*
const identity = <T>() => D.fromRefinement((_u: T): _u is T => true, 'Identity')

const undef = D.fromRefinement(
  (u: unknown): u is undefined => typeof u === 'undefined',
  'undefined'
)

const stringWithUndefined = pipe(
  D.union(undef, D.string),
  D.parse(s => D.success(s ?? ''))
)

const nonEmptyString = (message: string) =>
  pipe(
    stringWithUndefined,
    D.refine((x): x is string => x !== '', message)
  )

const coerce = <T>(value: T) =>
  pipe(
    D.fromRefinement(
      (_u: unknown): _u is T => true,
      `only '${JSON.stringify(value)}'`
    ),
    D.parse(() => D.success(value))
  )

const toUndefined = coerce(undefined)
*/

const stringToNumber = pipe(
  D.string,
  D.parse(s =>
    /[0-9]+/g.test(s)
    ? D.success(Number(s))
    : D.failure(s, "not number")),
)

const passport = D.struct({
  byr: stringToNumber,
  iyr: stringToNumber,
  eyr: stringToNumber,
  hgt: D.string,
  hcl: D.string,
  ecl: D.string,
  pid: D.string,
})

const cid = D.partial({
  cid: D.string,
})

const passportWithCid = pipe(passport, D.intersect(cid))

const stringToObject = pipe(
  D.string,
  D.parse(s => D.success(s.split(/[ \n]/).map(kv => kv.split(":")))),
  D.parse(xs =>
    xs.every(x => x.length == 2)
    ? D.success(xs)
    : D.failure(xs, "fail")
  ),
  D.parse(xs => D.success(xs.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}))),
)

const parser = pipe(
  stringToObject,
  D.parse(passportWithCid.decode),
)

const s = "ecl:gry pid:860033327 eyr:2020 hcl:#fffffd\nbyr:1937 iyr:2017 hgt:183cm cid:147"
const x = parser.decode(s)
if (isLeft(x)) {
  console.log(D.draw(x.left))
}
else {
  console.log(x.right)
}

