import { getContract } from "thirdweb";
import { parseAbi } from "viem";
import { thirdwebClient, hasThirdwebClientId } from "@/lib/thirdweb/client";
import { chain, CONTRACTS } from "@/lib/config";

export const tokenAbi = parseAbi([
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount, string reason)",
  "function burn(uint256 amount, string reason)",
  "function burnFrom(address from, uint256 amount, string reason)",
  "function adminBurn(address from, uint256 amount, string reason)",
  "function nonces(address owner) view returns (uint256)",
  "function DOMAIN_SEPARATOR() view returns (bytes32)",
  "function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Minted(address indexed to, uint256 amount, string reason)",
  "event Burned(address indexed from, uint256 amount, string reason)",
]);

export const campusAbi = parseAbi([
  "function registerStudent(address student, string nameHash)",
  "function registered(address) view returns (bool)",
  "function createSubject(string code, string name, uint8 credits, address professor) returns (uint256)",
  "function enrollStudent(uint256 subjectId, address student)",
  "function getStudentSubjects(address student) view returns (uint256[])",
  "function createTask(uint256 subjectId, string title, string description, uint256 reward) returns (uint256)",
  "function submitTask(uint256 taskId, bytes32 proofHash, address student)",
  "function approveSubmission(uint256 submissionId)",
  "function rejectSubmission(uint256 submissionId)",
  "function openAttendance(uint256 subjectId, bytes32 codeHash, uint256 durationSeconds) returns (uint256)",
  "function checkIn(uint256 sessionId, string code, address student)",
  "function closeAttendance(uint256 sessionId)",
  "function recordGrade(uint256 subjectId, address student, bytes32 scoreHash, uint8 creditsEarned, bool passed)",
  "function getStudentGrades(address student) view returns (uint256[])",
  "function award(address student, uint256 amount, string reason)",
  "function addProfessor(address professor)",
  "function removeProfessor(address professor)",
  "function subjects(uint256) view returns (uint256 id, string code, string name, uint8 credits, address professor, bool active)",
  "function tasks(uint256) view returns (uint256 id, uint256 subjectId, string title, string description, uint256 reward, address createdBy, bool active)",
  "function submissions(uint256) view returns (uint256 id, uint256 taskId, address student, bytes32 proofHash, bool approved, bool rejected)",
  "function sessions(uint256) view returns (uint256 id, uint256 subjectId, bytes32 codeHash, uint256 openedAt, uint256 closesAt, bool closed)",
  "function grades(uint256) view returns (uint256 subjectId, address student, bytes32 scoreHash, uint8 creditsEarned, bool passed, uint256 recordedAt)",
  "function taskCount() view returns (uint256)",
  "function subjectCount() view returns (uint256)",
  "function attendanceReward() view returns (uint256)",
  "function creditReward() view returns (uint256)",
  "function forumPostReward() view returns (uint256)",
]);

export const rewardsAbi = parseAbi([
  "function createReward(string name, string description, uint256 cost, uint256 stock) returns (uint256)",
  "function setRewardActive(uint256 rewardId, bool active)",
  "function redeem(uint256 rewardId, address student)",
  "function rewards(uint256) view returns (uint256 id, string name, string description, uint256 cost, uint256 stock, uint256 redeemed, bool active)",
  "function rewardCount() view returns (uint256)",
]);

export const collectiblesAbi = parseAbi([
  "function mintPass(address to, uint256 conferenceId, string uri) returns (uint256)",
  "function mintBadge(address to, uint256 badgeId, string uri) returns (uint256)",
  "function mintCertificate(address to, uint256 courseId, string uri) returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function isSoulbound(uint256 tokenId) view returns (bool)",
  "function items(uint256) view returns (uint8 kind, uint256 refId, string uri, bool soulbound)",
]);

export const coursesAbi = parseAbi([
  "function createCourse(string title, string description, uint256 price, uint256 seats, address instructor) returns (uint256)",
  "function enroll(uint256 courseId, address student)",
  "function completeCourse(uint256 courseId, address student, string certificateUri)",
  "function courses(uint256) view returns (uint256 id, string title, string description, uint256 price, address instructor, uint256 seats, uint256 enrolled, uint256 completed, bool active)",
  "function courseCount() view returns (uint256)",
  "function isEnrolled(uint256 courseId, address student) view returns (bool)",
  "function completed(uint256 courseId, address student) view returns (bool)",
]);

export const forumAbi = parseAbi([
  "function createPost(bytes32 contentHash, address author) returns (uint256)",
  "function upvote(uint256 postId, address voter)",
  "function downvote(uint256 postId, address voter)",
  "function report(uint256 postId, address reporter)",
  "function removePost(uint256 postId)",
  "function posts(uint256) view returns (uint256 id, address author, bytes32 contentHash, uint256 createdAt, uint256 upvotes, uint256 downvotes, uint256 tollDeposited, bool refunded, bool removed)",
  "function postCount() view returns (uint256)",
  "function toll() view returns (uint256)",
  "function refundThreshold() view returns (uint256)",
]);

type ContractKind = keyof typeof CONTRACTS;

export function isContractConfigured(kind: ContractKind) {
  return Boolean(CONTRACTS[kind]) && hasThirdwebClientId;
}

export function getZamoraContract(kind: ContractKind) {
  const address = CONTRACTS[kind];
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address) || !hasThirdwebClientId) {
    return null;
  }
  const base = { client: thirdwebClient, chain, address };
  switch (kind) {
    case "token":
      return getContract({ ...base, abi: tokenAbi });
    case "campus":
      return getContract({ ...base, abi: campusAbi });
    case "rewards":
      return getContract({ ...base, abi: rewardsAbi });
    case "collectibles":
      return getContract({ ...base, abi: collectiblesAbi });
    case "courses":
      return getContract({ ...base, abi: coursesAbi });
    case "forum":
      return getContract({ ...base, abi: forumAbi });
  }
}
