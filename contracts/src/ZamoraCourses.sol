// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

interface IZamoraC {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function burn(uint256 amount, string calldata reason) external;
}

interface ICollectiblesC {
    function mintCertificate(
        address to,
        uint256 courseId,
        string calldata uri
    ) external returns (uint256);
}

/**
 * @title ZamoraCourses
 * @notice Marketplace de cursos. El estudiante paga en ZAMORA: 80% al instructor
 *         y 20% se QUEMA. Al completar se mintea un certificado SBT.
 */
contract ZamoraCourses is AccessControl {
    bytes32 public constant INSTRUCTOR_ROLE = keccak256("INSTRUCTOR_ROLE");

    IZamoraC public token;
    ICollectiblesC public collectibles;

    uint256 public instructorShare = 80; // %
    uint256 public courseCount;

    struct Course {
        uint256 id;
        string title;
        string description;
        uint256 price;
        address instructor;
        uint256 seats;
        uint256 enrolled;
        uint256 completed;
        bool active;
    }

    mapping(uint256 => Course) public courses;
    mapping(uint256 => mapping(address => bool)) public isEnrolled;
    mapping(uint256 => mapping(address => bool)) public completed;

    event CourseCreated(uint256 indexed courseId, string title, uint256 price, address instructor);
    event Enrolled(uint256 indexed courseId, address indexed student, uint256 paid);
    event Completed(uint256 indexed courseId, address indexed student, uint256 certificateId);

    constructor(address admin, address tokenAddress, address collectiblesAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(INSTRUCTOR_ROLE, admin);
        token = IZamoraC(tokenAddress);
        collectibles = ICollectiblesC(collectiblesAddress);
    }

    function setInstructorShare(uint256 share) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(share <= 100, "Zamora: share invalido");
        instructorShare = share;
    }

    function setContracts(
        address tokenAddress,
        address collectiblesAddress
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        token = IZamoraC(tokenAddress);
        collectibles = ICollectiblesC(collectiblesAddress);
    }

    function createCourse(
        string calldata title,
        string calldata description,
        uint256 price,
        uint256 seats
    ) external returns (uint256) {
        courseCount += 1;
        courses[courseCount] = Course({
            id: courseCount,
            title: title,
            description: description,
            price: price,
            instructor: msg.sender,
            seats: seats,
            enrolled: 0,
            completed: 0,
            active: true
        });
        emit CourseCreated(courseCount, title, price, msg.sender);
        return courseCount;
    }

    function enroll(uint256 courseId) external {
        Course storage c = courses[courseId];
        require(c.active, "Zamora: curso inactivo");
        require(!isEnrolled[courseId][msg.sender], "Zamora: ya inscrito");
        if (c.seats > 0) {
            require(c.enrolled < c.seats, "Zamora: sin cupos");
        }
        require(
            token.transferFrom(msg.sender, address(this), c.price),
            "Zamora: pago rechazado"
        );
        uint256 instructorAmount = (c.price * instructorShare) / 100;
        uint256 burnAmount = c.price - instructorAmount;
        if (instructorAmount > 0) {
            token.transfer(c.instructor, instructorAmount);
        }
        if (burnAmount > 0) {
            token.burn(burnAmount, "course-burn");
        }
        isEnrolled[courseId][msg.sender] = true;
        c.enrolled += 1;
        emit Enrolled(courseId, msg.sender, c.price);
    }

    function completeCourse(
        uint256 courseId,
        address student,
        string calldata certificateUri
    ) external {
        Course storage c = courses[courseId];
        require(
            msg.sender == c.instructor || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Zamora: no autorizado"
        );
        require(isEnrolled[courseId][student], "Zamora: no inscrito");
        require(!completed[courseId][student], "Zamora: ya completado");
        completed[courseId][student] = true;
        c.completed += 1;
        uint256 certId = collectibles.mintCertificate(student, courseId, certificateUri);
        emit Completed(courseId, student, certId);
    }
}
