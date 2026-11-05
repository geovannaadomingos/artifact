import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { TRPCError } from "@trpc/server";
import { appRouter } from "../src/server/trpc/router";
import { createCallerFactory } from "../src/server/trpc/init";
import { taskRepository } from "../src/server/repositories/task.repository";

// Factory para criar o caller do tRPC simulando requisições internas
const createCaller = createCallerFactory(appRouter);
const caller = createCaller({});

describe("tRPC Task Router - Testes de Integração e Cenários CRUD", () => {
  beforeEach(() => {
    // Limpa e reinsere os dados de seed para manter previsibilidade nos testes
    taskRepository.clear();
    taskRepository.seedInitialData();
  });

  describe("Operação: create (Criação de Tarefas)", () => {
    it("[Positivo] Deve criar uma tarefa com título e descrição válidos", async () => {
      const input = {
        titulo: "Nova Tarefa de Teste",
        descricao: "Descrição detalhada da tarefa",
      };

      const result = await caller.task.create(input);

      assert.ok(result.id, "A tarefa deve ter um ID gerado");
      assert.match(
        result.id,
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        "O ID deve ser um UUID v4 válido"
      );
      assert.equal(result.titulo, "Nova Tarefa de Teste");
      assert.equal(result.descricao, "Descrição detalhada da tarefa");
      assert.ok(typeof result.dataCriacao === "number", "dataCriacao deve ser um timestamp numérico");
      assert.ok(result.dataCriacao > 0, "Timestamp deve ser positivo");

      // Verifica se a tarefa foi persistida no repositório
      const saved = await caller.task.getById({ id: result.id });
      assert.equal(saved.id, result.id);
    });

    it("[Positivo] Deve criar uma tarefa sem descrição (campo opcional)", async () => {
      const input = {
        titulo: "Tarefa Apenas Com Título",
      };

      const result = await caller.task.create(input);

      assert.ok(result.id);
      assert.equal(result.titulo, "Tarefa Apenas Com Título");
      assert.equal(result.descricao, undefined);
    });

    it("[Negativo] Deve rejeitar criação com título vazio", async () => {
      await assert.rejects(
        async () => {
          await caller.task.create({ titulo: "" });
        },
        (err: unknown) => {
          assert.ok(err instanceof TRPCError);
          assert.equal(err.code, "BAD_REQUEST");
          return true;
        }
      );
    });

    it("[Negativo] Deve rejeitar criação com título contendo apenas espaços", async () => {
      await assert.rejects(
        async () => {
          await caller.task.create({ titulo: "     " });
        },
        (err: unknown) => {
          assert.ok(err instanceof TRPCError);
          assert.equal(err.code, "BAD_REQUEST");
          return true;
        }
      );
    });

    it("[Negativo] Deve rejeitar criação com título que ultrapassa 100 caracteres", async () => {
      const tituloLongo = "a".repeat(101);
      await assert.rejects(
        async () => {
          await caller.task.create({ titulo: tituloLongo });
        },
        (err: unknown) => {
          assert.ok(err instanceof TRPCError);
          assert.equal(err.code, "BAD_REQUEST");
          return true;
        }
      );
    });
  });

  describe("Operações: list e getAll (Leitura e Paginação)", () => {
    it("[Positivo] Deve listar todas as tarefas via getAll em ordem decrescente de criação", async () => {
      const tasks = await caller.task.getAll();

      assert.ok(Array.isArray(tasks));
      assert.ok(tasks.length > 0, "Deve conter as tarefas do seed inicial");

      // Verifica ordenação decrescente de timestamp
      for (let i = 0; i < tasks.length - 1; i++) {
        assert.ok(
          tasks[i].dataCriacao >= tasks[i + 1].dataCriacao,
          "As tarefas devem estar ordenadas da mais recente para a mais antiga"
        );
      }
    });

    it("[Positivo] Deve retornar tarefas paginadas com limite e cursor (Infinite Scroll)", async () => {
      // Página 1: busca 5 itens
      const page1 = await caller.task.list({ limit: 5 });

      assert.equal(page1.items.length, 5);
      assert.ok(page1.nextCursor, "Deve retornar nextCursor para a próxima página");

      // Página 2: busca os próximos 5 itens a partir do cursor
      const page2 = await caller.task.list({
        limit: 5,
        cursor: page1.nextCursor,
      });

      assert.equal(page2.items.length, 5);
      // Garante que os itens da página 2 são diferentes da página 1
      const idsPage1 = new Set(page1.items.map((t) => t.id));
      for (const item of page2.items) {
        assert.ok(!idsPage1.has(item.id), "Página 2 não deve conter itens repetidos da Página 1");
      }
    });

    it("[Negativo] Deve rejeitar paginação com cursor em formato inválido (não UUID)", async () => {
      await assert.rejects(
        async () => {
          await caller.task.list({ cursor: "cursor-invalido-123" });
        },
        (err: unknown) => {
          assert.ok(err instanceof TRPCError);
          assert.equal(err.code, "BAD_REQUEST");
          return true;
        }
      );
    });
  });

  describe("Operação: getById (Busca Unitária)", () => {
    it("[Positivo] Deve retornar a tarefa existente quando o ID é válido", async () => {
      const created = await caller.task.create({
        titulo: "Tarefa para Busca Unitária",
        descricao: "Detalhes de busca",
      });

      const found = await caller.task.getById({ id: created.id });

      assert.equal(found.id, created.id);
      assert.equal(found.titulo, "Tarefa para Busca Unitária");
      assert.equal(found.descricao, "Detalhes de busca");
    });

    it("[Negativo] Deve retornar TRPCError NOT_FOUND ao buscar ID inexistente", async () => {
      const nonExistentUuid = "11111111-1111-4111-a111-111111111111";

      await assert.rejects(
        async () => {
          await caller.task.getById({ id: nonExistentUuid });
        },
        (err: unknown) => {
          assert.ok(err instanceof TRPCError);
          assert.equal(err.code, "NOT_FOUND");
          assert.match(err.message, /não foi encontrada/i);
          return true;
        }
      );
    });

    it("[Negativo] Deve retornar TRPCError BAD_REQUEST ao passar ID com formato inválido", async () => {
      await assert.rejects(
        async () => {
          await caller.task.getById({ id: "123-nao-eh-uuid" });
        },
        (err: unknown) => {
          assert.ok(err instanceof TRPCError);
          assert.equal(err.code, "BAD_REQUEST");
          return true;
        }
      );
    });
  });

  describe("Operação: update (Atualização de Tarefas)", () => {
    it("[Positivo] Deve atualizar título e descrição mantendo ID e dataCriacao inalterados", async () => {
      const created = await caller.task.create({
        titulo: "Título Inicial",
        descricao: "Descrição Inicial",
      });

      // Aguarda um pequeno delay para garantir que o timestamp mudaria se fosse recalculado
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updated = await caller.task.update({
        id: created.id,
        titulo: "Título Atualizado com Sucesso",
        descricao: "Nova Descrição Atualizada",
      });

      assert.equal(updated.id, created.id, "ID não deve mudar");
      assert.equal(updated.titulo, "Título Atualizado com Sucesso");
      assert.equal(updated.descricao, "Nova Descrição Atualizada");
      assert.equal(
        updated.dataCriacao,
        created.dataCriacao,
        "A data de criação original DEVE permanecer estritamente inalterada"
      );

      // Confirma que a persistência foi atualizada
      const fromStore = await caller.task.getById({ id: created.id });
      assert.equal(fromStore.titulo, "Título Atualizado com Sucesso");
    });

    it("[Negativo] Deve retornar TRPCError NOT_FOUND ao tentar atualizar tarefa inexistente", async () => {
      const nonExistentUuid = "22222222-2222-4222-a222-222222222222";

      await assert.rejects(
        async () => {
          await caller.task.update({
            id: nonExistentUuid,
            titulo: "Tentativa de Edição",
          });
        },
        (err: unknown) => {
          assert.ok(err instanceof TRPCError);
          assert.equal(err.code, "NOT_FOUND");
          assert.match(err.message, /não foi encontrada/i);
          return true;
        }
      );
    });

    it("[Negativo] Deve retornar TRPCError BAD_REQUEST ao atualizar com título em branco", async () => {
      const created = await caller.task.create({ titulo: "Título Válido" });

      await assert.rejects(
        async () => {
          await caller.task.update({
            id: created.id,
            titulo: "    ",
          });
        },
        (err: unknown) => {
          assert.ok(err instanceof TRPCError);
          assert.equal(err.code, "BAD_REQUEST");
          return true;
        }
      );
    });
  });

  describe("Operação: delete (Exclusão de Tarefas)", () => {
    it("[Positivo] Deve deletar uma tarefa existente e confirmar sua remoção", async () => {
      const created = await caller.task.create({
        titulo: "Tarefa a Ser Deletada",
      });

      const deleteResult = await caller.task.delete({ id: created.id });
      assert.equal(deleteResult.success, true);
      assert.equal(deleteResult.id, created.id);

      // Ao tentar buscar a tarefa agora deletada, deve retornar NOT_FOUND
      await assert.rejects(
        async () => {
          await caller.task.getById({ id: created.id });
        },
        (err: unknown) => {
          assert.ok(err instanceof TRPCError);
          assert.equal(err.code, "NOT_FOUND");
          return true;
        }
      );
    });

    it("[Negativo] Deve retornar TRPCError NOT_FOUND ao tentar deletar tarefa inexistente", async () => {
      const nonExistentUuid = "33333333-3333-4333-a333-333333333333";

      await assert.rejects(
        async () => {
          await caller.task.delete({ id: nonExistentUuid });
        },
        (err: unknown) => {
          assert.ok(err instanceof TRPCError);
          assert.equal(err.code, "NOT_FOUND");
          assert.match(err.message, /não foi encontrada/i);
          return true;
        }
      );
    });

    it("[Negativo] Deve retornar TRPCError BAD_REQUEST ao tentar deletar com formato inválido de ID", async () => {
      await assert.rejects(
        async () => {
          await caller.task.delete({ id: "id-invalido-xyz" });
        },
        (err: unknown) => {
          assert.ok(err instanceof TRPCError);
          assert.equal(err.code, "BAD_REQUEST");
          return true;
        }
      );
    });
  });
});
