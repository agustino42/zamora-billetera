// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

interface IZamoraToken {
    function mint(address to, uint256 amount, string calldata reason) external;
}

/**
 * @title ZamoraCampus
 * @notice Registro académico on-chain: roles (admin/profesor/estudiante),
 *         materias, inscripciones, tareas, asistencia y notas.
 * @dev Las notas se guardan como HASH (privacidad); el valor real vive off-chain.
 *      Los créditos aprobados disparan acuñación de ZAMORA.
 */
contract ZamoraCampus is AccessControl {
    bytes32 public constant PROFESSOR_ROLE = keccak256("PROFESSOR_ROLE");
    bytes32 public constant STUDENT_ROLE = keccak256("STUDENT_ROLE");

    IZamoraToken public token;

    // --- Configuración de recompensas (unidades de ZAMORA) ---
    uint256 public attendanceReward = 10;
    uint256 public taskRewardMultiplier = 1; // reward de cada tarea lo fija el profesor
    uint256 public creditReward = 100; // ZAMORA por crédito aprobado
    uint256 public forumPostReward = 2;

    uint256 public subjectCount;
    uint256 public taskCount;
    uint256 public submissionCount;
    uint256 public sessionCount;

    struct Subject {
        uint256 id;
        string code;
        string name;
        uint8 credits;
        address professor;
        bool active;
    }

    struct Task {
        uint256 id;
        uint256 subjectId;
        string title;
        string description;
        uint256 reward;
        address createdBy;
        bool active;
    }

    struct Submission {
        uint256 id;
        uint256 taskId;
        address student;
        bytes32 proofHash;
        bool approved;
        bool rejected;
    }

    struct Session {
        uint256 id;
        uint256 subjectId;
        bytes32 codeHash;
        uint256 openedAt;
        uint256 closesAt;
        bool closed;
    }

    struct Grade {
        uint256 subjectId;
        address student;
        bytes32 scoreHash;
        uint8 creditsEarned;
        bool passed;
        uint256 recordedAt;
    }

    mapping(uint256 => Subject) public subjects;
    mapping(uint256 => Task) public tasks;
    mapping(uint256 => Submission) public submissions;
    mapping(uint256 => Session) public sessions;

    mapping(uint256 => mapping(address => bool)) public enrolled; // subjectId => student
    mapping(uint256 => mapping(address => bool)) public checkedIn; // sessionId => student
    mapping(address => uint256[]) private studentSubjects;

    Grade[] public grades;
    mapping(address => uint256[]) private studentGradeIds;
    mapping(address => bool) public registered;

    event ProfessorAdded(address indexed professor);
    event ProfessorRemoved(address indexed professor);
    event StudentRegistered(address indexed student, string nameHash);
    event SubjectCreated(uint256 indexed subjectId, string code, address professor);
    event StudentEnrolled(uint256 indexed subjectId, address indexed student);
    event TaskCreated(uint256 indexed taskId, uint256 indexed subjectId, uint256 reward);
    event TaskSubmitted(uint256 indexed submissionId, uint256 indexed taskId, address indexed student);
    event TaskApproved(uint256 indexed submissionId, address indexed student, uint256 reward);
    event AttendanceOpened(uint256 indexed sessionId, uint256 indexed subjectId, uint256 closesAt);
    event AttendanceCheckedIn(uint256 indexed sessionId, address indexed student);
    event AttendanceClosed(uint256 indexed sessionId);
    event GradeRecorded(address indexed student, uint256 indexed subjectId, uint8 creditsEarned, bool passed);
    event Awarded(address indexed student, uint256 amount, string reason);

    modifier onlyProfessorOrAdmin() {
        require(
            hasRole(PROFESSOR_ROLE, msg.sender) || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Zamora: solo profesor o admin"
        );
        _;
    }

    constructor(address admin, address tokenAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        token = IZamoraToken(tokenAddress);
    }

    // ------------------------------------------------------------------
    // Administración
    // ------------------------------------------------------------------
    function setToken(address tokenAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        token = IZamoraToken(tokenAddress);
    }

    function addProfessor(address professor) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(PROFESSOR_ROLE, professor);
        emit ProfessorAdded(professor);
    }

    function removeProfessor(address professor) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(PROFESSOR_ROLE, professor);
        emit ProfessorRemoved(professor);
    }

    function setRewardConfig(
        uint256 _attendanceReward,
        uint256 _creditReward,
        uint256 _forumPostReward
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        attendanceReward = _attendanceReward;
        creditReward = _creditReward;
        forumPostReward = _forumPostReward;
    }

    // ------------------------------------------------------------------
    // Estudiantes y materias
    // ------------------------------------------------------------------
    function registerStudent(address student, string calldata nameHash) external {
        if (msg.sender != student) {
            require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Zamora: no autorizado");
        }
        if (!hasRole(STUDENT_ROLE, student)) {
            _grantRole(STUDENT_ROLE, student);
        }
        registered[student] = true;
        emit StudentRegistered(student, nameHash);
    }

    function createSubject(
        string calldata code,
        string calldata name,
        uint8 credits,
        address professor
    ) external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256) {
        subjectCount += 1;
        subjects[subjectCount] = Subject({
            id: subjectCount,
            code: code,
            name: name,
            credits: credits,
            professor: professor,
            active: true
        });
        emit SubjectCreated(subjectCount, code, professor);
        return subjectCount;
    }

    function enrollStudent(uint256 subjectId, address student) external onlyProfessorOrAdmin {
        require(subjects[subjectId].active, "Zamora: materia inactiva");
        enrolled[subjectId][student] = true;
        studentSubjects[student].push(subjectId);
        emit StudentEnrolled(subjectId, student);
    }

    function getStudentSubjects(address student) external view returns (uint256[] memory) {
        return studentSubjects[student];
    }

    // ------------------------------------------------------------------
    // Tareas
    // ------------------------------------------------------------------
    function createTask(
        uint256 subjectId,
        string calldata title,
        string calldata description,
        uint256 reward
    ) external onlyProfessorOrAdmin returns (uint256) {
        taskCount += 1;
        tasks[taskCount] = Task({
            id: taskCount,
            subjectId: subjectId,
            title: title,
            description: description,
            reward: reward,
            createdBy: msg.sender,
            active: true
        });
        emit TaskCreated(taskCount, subjectId, reward);
        return taskCount;
    }

    /// @notice Registra una entrega en nombre del estudiante. La firma el
    ///         relayer (profesor/admin), de modo que el alumno no paga gas.
    function submitTask(
        uint256 taskId,
        bytes32 proofHash,
        address student
    ) external onlyProfessorOrAdmin {
        require(tasks[taskId].active, "Zamora: tarea inactiva");
        submissionCount += 1;
        submissions[submissionCount] = Submission({
            id: submissionCount,
            taskId: taskId,
            student: student,
            proofHash: proofHash,
            approved: false,
            rejected: false
        });
        emit TaskSubmitted(submissionCount, taskId, student);
    }

    function approveSubmission(uint256 submissionId) external onlyProfessorOrAdmin {
        Submission storage s = submissions[submissionId];
        require(!s.approved && !s.rejected, "Zamora: ya procesada");
        s.approved = true;
        uint256 reward = tasks[s.taskId].reward;
        token.mint(s.student, reward, "task");
        emit TaskApproved(submissionId, s.student, reward);
    }

    function rejectSubmission(uint256 submissionId) external onlyProfessorOrAdmin {
        Submission storage s = submissions[submissionId];
        require(!s.approved && !s.rejected, "Zamora: ya procesada");
        s.rejected = true;
    }

    // ------------------------------------------------------------------
    // Asistencia
    // ------------------------------------------------------------------
    function openAttendance(
        uint256 subjectId,
        bytes32 codeHash,
        uint256 durationSeconds
    ) external onlyProfessorOrAdmin returns (uint256) {
        sessionCount += 1;
        sessions[sessionCount] = Session({
            id: sessionCount,
            subjectId: subjectId,
            codeHash: codeHash,
            openedAt: block.timestamp,
            closesAt: block.timestamp + durationSeconds,
            closed: false
        });
        emit AttendanceOpened(sessionCount, subjectId, block.timestamp + durationSeconds);
        return sessionCount;
    }

    /// @notice Marca asistencia en nombre del estudiante. La firma el relayer
    ///         (profesor/admin); el código sigue validándose on-chain.
    function checkIn(
        uint256 sessionId,
        string calldata code,
        address student
    ) external onlyProfessorOrAdmin {
        Session storage s = sessions[sessionId];
        require(!s.closed, "Zamora: sesion cerrada");
        require(block.timestamp <= s.closesAt, "Zamora: fuera de tiempo");
        require(keccak256(abi.encodePacked(code)) == s.codeHash, "Zamora: codigo invalido");
        require(!checkedIn[sessionId][student], "Zamora: ya registrado");
        checkedIn[sessionId][student] = true;
        token.mint(student, attendanceReward, "attendance");
        emit AttendanceCheckedIn(sessionId, student);
    }

    function closeAttendance(uint256 sessionId) external onlyProfessorOrAdmin {
        sessions[sessionId].closed = true;
        emit AttendanceClosed(sessionId);
    }

    // ------------------------------------------------------------------
    // Notas / créditos
    // ------------------------------------------------------------------
    function recordGrade(
        uint256 subjectId,
        address student,
        bytes32 scoreHash,
        uint8 creditsEarned,
        bool passed
    ) external onlyProfessorOrAdmin {
        grades.push(
            Grade({
                subjectId: subjectId,
                student: student,
                scoreHash: scoreHash,
                creditsEarned: creditsEarned,
                passed: passed,
                recordedAt: block.timestamp
            })
        );
        studentGradeIds[student].push(grades.length - 1);
        if (passed && creditsEarned > 0) {
            token.mint(student, uint256(creditsEarned) * creditReward, "credits");
        }
        emit GradeRecorded(student, subjectId, creditsEarned, passed);
    }

    function getStudentGrades(address student) external view returns (uint256[] memory) {
        return studentGradeIds[student];
    }

    function award(
        address student,
        uint256 amount,
        string calldata reason
    ) external onlyProfessorOrAdmin {
        token.mint(student, amount, reason);
        emit Awarded(student, amount, reason);
    }
}
