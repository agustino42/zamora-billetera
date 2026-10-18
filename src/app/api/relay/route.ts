import { NextResponse, type NextRequest } from "next/server";
import {
  relayCall,
  submitPermit,
  getSystemAddress,
  isRelayerConfigured,
  type PermitPayload,
} from "@/lib/onchain/server";
import { authenticateStaff, authenticateStudent } from "@/lib/onchain/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = Record<string, unknown>;

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function good(hash: string) {
  return NextResponse.json({ ok: true, hash });
}

function asString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Campo "${field}" inválido.`);
  }
  return value;
}

function asNumber(value: unknown, field: string): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) {
    throw new Error(`Campo "${field}" inválido.`);
  }
  return n;
}

// ---------------------------------------------------------------------------
// Acciones de estudiante (el alumno firma; el relayer ejecuta y paga el gas)
// ---------------------------------------------------------------------------

async function studentActions(
  action: string,
  body: Body,
  address: string,
): Promise<string> {
  switch (action) {
    case "register": {
      return relayCall("campus", "function registerStudent(address student, string nameHash)", [
        address,
        asString(body.nameHash ?? "zamora", "nameHash"),
      ]);
    }

    case "transfer": {
      const permit = body.permit as PermitPayload | undefined;
      if (!permit) throw new Error("Falta el permiso firmado.");
      await submitPermit({ ...permit, spender: getSystemAddress() });
      return relayCall("token", "function transferFrom(address from, address to, uint256 amount)", [
        address,
        asString(body.to, "to"),
        BigInt(asNumber(body.amount, "amount")),
      ]);
    }

    case "submit-task": {
      return relayCall(
        "campus",
        "function submitTask(uint256 taskId, bytes32 proofHash, address student)",
        [
          BigInt(asNumber(body.taskId, "taskId")),
          asString(body.proofHash, "proofHash"),
          address,
        ],
      );
    }

    case "attendance-checkin": {
      return relayCall("campus", "function checkIn(uint256 sessionId, string code, address student)", [
        BigInt(asNumber(body.sessionId, "sessionId")),
        asString(body.code, "code"),
        address,
      ]);
    }

    case "forum-post": {
      const permit = body.permit as PermitPayload | undefined;
      if (!permit) throw new Error("Falta firma (permit) para el peaje.");
      await submitPermit(permit);
      return relayCall("forum", "function createPost(bytes32 contentHash, address author)", [
        asString(body.contentHash, "contentHash"),
        address,
      ]);
    }

    case "forum-vote": {
      const direction = body.direction === "down" ? "downvote" : "upvote";
      return relayCall("forum", `function ${direction}(uint256 postId, address voter)`, [
        BigInt(asNumber(body.postId, "postId")),
        address,
      ]);
    }

    case "rewards-redeem": {
      const permit = body.permit as PermitPayload | undefined;
      if (!permit) throw new Error("Falta firma (permit) para quemar ZAMORA.");
      await submitPermit(permit);
      return relayCall("rewards", "function redeem(uint256 rewardId, address student)", [
        BigInt(asNumber(body.rewardId, "rewardId")),
        address,
      ]);
    }

    case "courses-enroll": {
      const permit = body.permit as PermitPayload | undefined;
      if (!permit) throw new Error("Falta firma (permit) para pagar el curso.");
      await submitPermit(permit);
      return relayCall("courses", "function enroll(uint256 courseId, address student)", [
        BigInt(asNumber(body.courseId, "courseId")),
        address,
      ]);
    }

    case "boost-burn": {
      const permit = body.permit as PermitPayload | undefined;
      if (!permit) throw new Error("Falta firma (permit) para el boost.");
      await submitPermit(permit);
      return relayCall("token", "function burnFrom(address from, uint256 amount, string reason)", [
        address,
        BigInt(asNumber(body.amount, "amount")),
        "boost",
      ]);
    }

    case "faucet": {
      const amount = body.amount ? asNumber(body.amount, "amount") : 50;
      return relayCall("token", "function mint(address to, uint256 amount, string reason)", [
        address,
        BigInt(Math.round(amount)),
        "faucet",
      ]);
    }

    default:
      throw new Error(`Acción de estudiante desconocida: ${action}`);
  }
}

// ---------------------------------------------------------------------------
// Acciones de profesor/admin (ya autenticados; el relayer ejecuta)
// ---------------------------------------------------------------------------

async function staffActions(action: string, body: Body): Promise<string> {
  switch (action) {
    case "subject-create":
      return relayCall(
        "campus",
        "function createSubject(string code, string name, uint8 credits, address professor)",
        [
          asString(body.code, "code"),
          asString(body.name, "name"),
          asNumber(body.credits, "credits"),
          asString(body.professor, "professor"),
        ],
      );

    case "task-create":
      return relayCall(
        "campus",
        "function createTask(uint256 subjectId, string title, string description, uint256 reward)",
        [
          BigInt(asNumber(body.subjectId, "subjectId")),
          asString(body.title, "title"),
          asString(body.description, "description"),
          BigInt(asNumber(body.reward, "reward")),
        ],
      );

    case "task-review":
      return relayCall(
        "campus",
        body.approve === false
          ? "function rejectSubmission(uint256 submissionId)"
          : "function approveSubmission(uint256 submissionId)",
        [BigInt(asNumber(body.submissionId, "submissionId"))],
      );

    case "grade-record":
      return relayCall(
        "campus",
        "function recordGrade(uint256 subjectId, address student, bytes32 scoreHash, uint8 creditsEarned, bool passed)",
        [
          BigInt(asNumber(body.subjectId, "subjectId")),
          asString(body.student, "student"),
          asString(body.scoreHash, "scoreHash"),
          asNumber(body.creditsEarned, "creditsEarned"),
          Boolean(body.passed),
        ],
      );

    case "attendance-open":
      return relayCall(
        "campus",
        "function openAttendance(uint256 subjectId, bytes32 codeHash, uint256 durationSeconds)",
        [
          BigInt(asNumber(body.subjectId, "subjectId")),
          asString(body.codeHash, "codeHash"),
          BigInt(asNumber(body.durationSeconds ?? 1800, "durationSeconds")),
        ],
      );

    case "attendance-close":
      return relayCall("campus", "function closeAttendance(uint256 sessionId)", [
        BigInt(asNumber(body.sessionId, "sessionId")),
      ]);

    case "award":
      return relayCall("campus", "function award(address student, uint256 amount, string reason)", [
        asString(body.student, "student"),
        BigInt(asNumber(body.amount, "amount")),
        asString(body.reason ?? "premio", "reason"),
      ]);

    case "enroll-student":
      return relayCall("campus", "function enrollStudent(uint256 subjectId, address student)", [
        BigInt(asNumber(body.subjectId, "subjectId")),
        asString(body.student, "student"),
      ]);

    case "reward-create":
      return relayCall(
        "rewards",
        "function createReward(string name, string description, uint256 cost, uint256 stock)",
        [
          asString(body.name, "name"),
          asString(body.description ?? "", "description"),
          BigInt(asNumber(body.cost, "cost")),
          BigInt(asNumber(body.stock ?? 0, "stock")),
        ],
      );

    case "course-create":
      return relayCall(
        "courses",
        "function createCourse(string title, string description, uint256 price, uint256 seats, address instructor)",
        [
          asString(body.title, "title"),
          asString(body.description ?? "", "description"),
          BigInt(asNumber(body.price ?? 0, "price")),
          BigInt(asNumber(body.seats ?? 0, "seats")),
          asString(body.instructor, "instructor"),
        ],
      );

    case "course-complete":
      return relayCall(
        "courses",
        "function completeCourse(uint256 courseId, address student, string certificateUri)",
        [
          BigInt(asNumber(body.courseId, "courseId")),
          asString(body.student, "student"),
          asString(body.certificateUri ?? "", "certificateUri"),
        ],
      );

    case "certificate-mint":
      return relayCall(
        "collectibles",
        "function mintCertificate(address to, uint256 courseId, string uri)",
        [
          asString(body.to, "to"),
          BigInt(asNumber(body.refId ?? 0, "refId")),
          asString(body.uri ?? "", "uri"),
        ],
      );

    case "badge-mint":
      return relayCall("collectibles", "function mintBadge(address to, uint256 badgeId, string uri)", [
        asString(body.to, "to"),
        BigInt(asNumber(body.refId ?? 0, "refId")),
        asString(body.uri ?? "", "uri"),
      ]);

    case "pass-mint":
      return relayCall("collectibles", "function mintPass(address to, uint256 conferenceId, string uri)", [
        asString(body.to, "to"),
        BigInt(asNumber(body.refId ?? 0, "refId")),
        asString(body.uri ?? "", "uri"),
      ]);

    case "forum-remove":
      return relayCall("forum", "function removePost(uint256 postId)", [
        BigInt(asNumber(body.postId, "postId")),
      ]);

    case "treasury-mint":
      return relayCall("token", "function mint(address to, uint256 amount, string reason)", [
        asString(body.to, "to"),
        BigInt(asNumber(body.amount, "amount")),
        asString(body.reason ?? "treasury", "reason"),
      ]);

    case "treasury-burn":
      return relayCall("token", "function adminBurn(address from, uint256 amount, string reason)", [
        asString(body.from, "from"),
        BigInt(asNumber(body.amount, "amount")),
        asString(body.reason ?? "treasury", "reason"),
      ]);

    case "seed-demo": {
      const { seedDemoData } = await import("@/lib/onchain/seed");
      const { hashes } = await seedDemoData(getSystemAddress());
      return hashes[hashes.length - 1] ?? "0x";
    }

    default:
      throw new Error(`Acción de staff desconocida: ${action}`);
  }
}

export async function POST(request: NextRequest) {
  if (!isRelayerConfigured()) {
    return bad(
      "El relayer no está configurado (faltan SYSTEM_WALLET_PRIVATE_KEY o direcciones de contrato).",
      503,
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return bad("JSON inválido.");
  }

  const action = typeof body.action === "string" ? body.action : "";
  if (!action) return bad('Falta el campo "action".');

  const studentPrefixes = [
    "register",
    "submit-task",
    "attendance-checkin",
    "forum-post",
    "forum-vote",
    "rewards-redeem",
    "courses-enroll",
    "transfer",
    "boost-burn",
    "faucet",
  ];
  const isStudentAction = studentPrefixes.includes(action);

  try {
    if (isStudentAction) {
      const address = await authenticateStudent(body.auth as never, action);
      const hash = await studentActions(action, body, address);
      return good(hash);
    }

    await authenticateStaff(request.headers.get("x-zamora-role"));
    const hash = await staffActions(action, body);
    return good(hash);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado.";
    return bad(message, 400);
  }
}
