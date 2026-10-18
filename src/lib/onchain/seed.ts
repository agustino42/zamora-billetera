import { keccak256, toBytes } from "viem";
import { readServer, relayCall } from "@/lib/onchain/server";
import { demoCourses, demoRewards, demoSubjects, demoTasks } from "@/lib/mock-data";

function onchainId(id: string) {
  return Number(id.replace(/\D/g, "")) || 0;
}

async function count(kind: "campus" | "rewards" | "courses", method: string) {
  try {
    const value = await readServer(kind, method, []);
    return Number(value as bigint);
  } catch {
    return 0;
  }
}

/**
 * Crea on-chain los datos de demostración (materias, tareas, recompensas y
 * cursos) con IDs secuenciales que coinciden con los IDs mock de la app
 * (`sub-1` → id 1, `rw-1` → id 1, …). Idempotente: no duplica si ya hay datos.
 */
export async function seedDemoData(adminAddress: string) {
  const hashes: string[] = [];

  const subjectCount = await count("campus", "function subjectCount() view returns (uint256)");
  if (subjectCount === 0) {
    for (const s of demoSubjects) {
      hashes.push(
        await relayCall(
          "campus",
          "function createSubject(string code, string name, uint8 credits, address professor)",
          [s.code, s.name, s.credits, adminAddress],
        ),
      );
    }
    for (const t of demoTasks) {
      hashes.push(
        await relayCall(
          "campus",
          "function createTask(uint256 subjectId, string title, string description, uint256 reward)",
          [BigInt(onchainId(t.subjectId) || 1), t.title, t.description, BigInt(t.reward)],
        ),
      );
    }
  }

  const sessionCount = await count("campus", "function sessionCount() view returns (uint256)");
  if (sessionCount === 0) {
    hashes.push(
      await relayCall(
        "campus",
        "function openAttendance(uint256 subjectId, bytes32 codeHash, uint256 durationSeconds)",
        [BigInt(5), keccak256(toBytes("ZAM-4821")), BigInt(60 * 60 * 24 * 7)],
      ),
    );
  }

  const rewardCount = await count("rewards", "function rewardCount() view returns (uint256)");
  if (rewardCount === 0) {
    for (const r of demoRewards) {
      hashes.push(
        await relayCall(
          "rewards",
          "function createReward(string name, string description, uint256 cost, uint256 stock)",
          [r.name, r.description, BigInt(r.cost), BigInt(r.stock)],
        ),
      );
    }
  }

  const courseCount = await count("courses", "function courseCount() view returns (uint256)");
  if (courseCount === 0) {
    for (const c of demoCourses) {
      hashes.push(
        await relayCall(
          "courses",
          "function createCourse(string title, string description, uint256 price, uint256 seats, address instructor)",
          [c.title, c.description, BigInt(c.price), BigInt(c.seats), adminAddress],
        ),
      );
    }
  }

  return { created: hashes.length, hashes };
}
