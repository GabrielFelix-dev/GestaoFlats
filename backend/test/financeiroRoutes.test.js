import assert from "node:assert/strict";
import test from "node:test";
import { createApp } from "../src/app.js";
import { signToken } from "../src/utils/jwt.js";

test("rentabilidade está montado e exige autenticação", async (context) => {
    const server = createApp().listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    context.after(
        () => new Promise((resolve, reject) => {
            server.close((error) => (error ? reject(error) : resolve()));
        }),
    );

    const response = await fetch(
        `http://127.0.0.1:${server.address().port}/api/financeiro/rentabilidade`,
    );

    assert.equal(response.status, 401);
    assert.equal((await response.json()).erro, "Token de acesso não informado.");
});

test("rentabilidade rejeita datas inválidas antes de consultar o banco", async (context) => {
    const server = createApp().listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    context.after(
        () => new Promise((resolve, reject) => {
            server.close((error) => (error ? reject(error) : resolve()));
        }),
    );

    const token = signToken({ sub: "507f1f77bcf86cd799439011", email: "test@example.com", role: "admin" });
    const baseUrl = `http://127.0.0.1:${server.address().port}/api/financeiro/rentabilidade`;
    const invalidCalendarDate = await fetch(
        `${baseUrl}?dataInicial=2026-02-30&dataFinal=2026-03-01`,
        { headers: { Authorization: `Bearer ${token}` } },
    );
    const invertedRange = await fetch(
        `${baseUrl}?dataInicial=2026-09-03&dataFinal=2026-09-01`,
        { headers: { Authorization: `Bearer ${token}` } },
    );

    assert.equal(invalidCalendarDate.status, 422);
    assert.equal(invertedRange.status, 422);
});