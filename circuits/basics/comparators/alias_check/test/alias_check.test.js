const chai = require("chai");
const path = require("path");

const assert = chai.assert;
const bigInt = require("big-integer");

const tester = require("circom").tester;

function print(circuit, w, s) {
    console.log(s + ": " + w[circuit.getSignalIdx(s)]);
}

function getBits(v, n) {
    const res = [];
    for (let i=0; i<n; i++) {
        if (v.shiftRight(i).isOdd()) {
            res.push(bigInt.one);
        } else {
            res.push(bigInt.zero);
        }
    }
    return res;
}

const q = bigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");

describe("Aliascheck test", function () {
    
    this.timeout(100000);

    let cir;
    before( async() => {
        cir = await tester(path.join(__dirname, "alias_check.test.circom"));
    });

    it("Should satisfy the aliastest 0", async () => {
        const inp = getBits(bigInt.zero, 254);
        await cir.calculateWitness({in: inp}, true);
    });

    it("Should satisfy the aliastest 3", async () => {
        const inp = getBits(bigInt(3), 254);
        await cir.calculateWitness({in: inp}, true);
    });

    //(q-1)/2?
    it("Should satisfy the aliastest q-1", async () => {
        const inp = getBits(q.minus(bigInt.one), 254);
        await cir.calculateWitness({in: inp}, true);
    });

    it("Should NOT satisfy an input of q", async () => {
        const inp = getBits(q, 254);
        try {
            await cir.calculateWitness({in: inp}, true);
            assert(false);
        } catch(err) {
            assert(/Constraint\sdoesn't\smatch(.*)1\s!=\s0/.test(err.message) );
        }
    });

    it("Should NOT satisfy all ones", async () => {

        const inp = getBits(bigInt(1).shiftLeft(254).minus(bigInt.one), 254);
        try {
            await cir.calculateWitness({in: inp}, true);
            assert(false);
        } catch(err) {
            assert(/Constraint\sdoesn't\smatch(.*)1\s!=\s0/.test(err.message) );
        }
    });

});
