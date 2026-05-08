import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  SHEET_COMPRAS,
  SHEET_ESTOQUE,
  readRange,
  rowsToObjects,
  updateRange,
} from "./sheets.server";

export const getEstoque = createServerFn({ method: "GET" }).handler(async () => {
  const rows = await readRange(SHEET_ESTOQUE, "Relatório Estoque!A1:M");
  return rowsToObjects(rows);
});

export const getCompras = createServerFn({ method: "GET" }).handler(async () => {
  const rows = await readRange(SHEET_COMPRAS, "Compras Realizadas!A1:I");
  return rowsToObjects(rows);
});

export const getCotacoes = createServerFn({ method: "GET" }).handler(async () => {
  const rows = await readRange(SHEET_COMPRAS, "Cotações!A1:I");
  return rowsToObjects(rows);
});

export const getFornecedores = createServerFn({ method: "GET" }).handler(async () => {
  const rows = await readRange(SHEET_COMPRAS, "Fornecedores!A1:I");
  return rowsToObjects(rows);
});

export const getItens = createServerFn({ method: "GET" }).handler(async () => {
  const rows = await readRange(SHEET_COMPRAS, "Itens!A1:B");
  return rowsToObjects(rows);
});

export const getRetornos = createServerFn({ method: "GET" }).handler(async () => {
  const rows = await readRange(SHEET_COMPRAS, "Retorno dos Fornecedores!A1:T");
  return rowsToObjects(rows);
});

const updateFornecedorSchema = z.object({
  rowIndex: z.number().int().min(2),
  email: z.string(),
  telefone: z.string(),
  status: z.string(),
  cidade: z.string(),
});

export const updateFornecedor = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => updateFornecedorSchema.parse(d))
  .handler(async ({ data }) => {
    await updateRange(SHEET_COMPRAS, `Fornecedores!C${data.rowIndex}:H${data.rowIndex}`, [
      [data.email, data.telefone, "", "", data.status, data.cidade],
    ]);
    return { ok: true };
  });
