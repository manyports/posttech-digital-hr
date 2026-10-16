import { test } from "node:test";
import assert from "node:assert/strict";
import { COURSES } from "../lib/seed/courses";

const EXPECTED: Record<
  string,
  { lessons: number; questions: number; mandatory: boolean }
> = {
  "course-infosec": { lessons: 4, questions: 6, mandatory: true },
  "course-conduct": { lessons: 3, questions: 5, mandatory: true },
  "course-remote": { lessons: 3, questions: 5, mandatory: false },
  "course-onboard": { lessons: 3, questions: 4, mandatory: false },
  "course-1on1": { lessons: 3, questions: 4, mandatory: false },
};

test("has exactly the 5 expected courses with unique ids", () => {
  assert.equal(COURSES.length, 5);
  const ids = COURSES.map((c) => c._id);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual([...ids].sort(), Object.keys(EXPECTED).sort());
});

test("lesson/question counts, mandatory flags, passScore, duration", () => {
  for (const c of COURSES) {
    const exp = EXPECTED[c._id];
    assert.ok(exp, `unexpected course ${c._id}`);
    assert.equal(c.lessons.length, exp.lessons, `${c._id} lessons`);
    assert.equal(c.test.questions.length, exp.questions, `${c._id} questions`);
    assert.equal(c.mandatory, exp.mandatory, `${c._id} mandatory`);
    assert.equal(c.test.passScore, 70, `${c._id} passScore`);
    const sum = c.lessons.reduce((s, l) => s + l.durationMin, 0);
    assert.equal(c.durationMin, sum + 5, `${c._id} durationMin`);
    assert.ok(c.title.trim() && c.description.trim() && c.category.trim());
  }
});

test("lesson and question ids are unique per course", () => {
  for (const c of COURSES) {
    const lids = c.lessons.map((l) => l.id);
    assert.equal(new Set(lids).size, lids.length, `${c._id} lesson ids`);
    const qids = c.test.questions.map((q) => q.id);
    assert.equal(new Set(qids).size, qids.length, `${c._id} question ids`);
  }
});

test("every lesson is complete", () => {
  for (const c of COURSES) {
    for (const l of c.lessons) {
      const where = `${c._id}/${l.id}`;
      assert.ok(l.title.trim(), `${where} title`);
      assert.ok(l.summary.trim(), `${where} summary`);
      assert.ok(
        Number.isInteger(l.durationMin) &&
          l.durationMin >= 3 &&
          l.durationMin <= 8,
        `${where} durationMin`,
      );
      assert.ok(l.body.length >= 2, `${where} needs >=2 paragraphs`);
      for (const p of l.body) assert.ok(p.trim(), `${where} empty paragraph`);
      assert.equal(l.keyPoints.length, 3, `${where} keyPoints`);
      for (const k of l.keyPoints) assert.ok(k.trim(), `${where} empty keyPoint`);
    }
  }
});

test("every question is well-formed", () => {
  for (const c of COURSES) {
    for (const q of c.test.questions) {
      const where = `${c._id}/${q.id}`;
      assert.ok(q.text.trim(), `${where} text`);
      assert.ok(
        q.options.length >= 3 && q.options.length <= 4,
        `${where} option count`,
      );
      for (const o of q.options) {
        assert.equal(typeof o, "string");
        assert.ok(o.trim(), `${where} empty option`);
      }
      assert.equal(
        new Set(q.options.map((o) => o.trim().toLowerCase())).size,
        q.options.length,
        `${where} duplicate options`,
      );
      assert.ok(
        Number.isInteger(q.correctIndex) &&
          q.correctIndex >= 0 &&
          q.correctIndex < q.options.length,
        `${where} correctIndex`,
      );
    }
  }
});

test("correct answers are spread across positions", () => {
  const counts = [0, 0, 0, 0];
  for (const c of COURSES) {
    for (const q of c.test.questions) counts[q.correctIndex]++;
  }
  for (const i of [0, 1, 2]) {
    assert.ok(counts[i] >= 3, `correctIndex ${i} appears ${counts[i]} times`);
  }
});
