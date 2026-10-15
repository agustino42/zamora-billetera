// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ZamoraToken (ZAM)
 * @notice Token de incentivos del campus. Los estudiantes lo ganan por notas,
 *         asistencia y tareas, y lo gastan en recompensas, cursos y foro.
 * @dev Control de acceso por roles. El "system wallet" (backend) y el contrato
 *      ZamoraCampus reciben MINTER_ROLE.
 */
contract ZamoraToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    event Minted(address indexed to, uint256 amount, string reason);
    event Burned(address indexed from, uint256 amount, string reason);

    constructor(
        string memory name_,
        string memory symbol_,
        address admin
    ) ERC20(name_, symbol_) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(BURNER_ROLE, admin);
    }

    /// @notice Acuña ZAMORA. `reason` queda en el evento como registro auditable.
    function mint(
        address to,
        uint256 amount,
        string calldata reason
    ) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
        emit Minted(to, amount, reason);
    }

    /// @notice Quema ZAMORA de la propia cuenta (sinks: foro, boost, comisiones).
    function burn(uint256 amount, string calldata reason) external {
        _burn(msg.sender, amount);
        emit Burned(msg.sender, amount, reason);
    }

    /// @notice Quema ZAMORA de otra cuenta con autorización previa (allowance).
    function burnFrom(
        address from,
        uint256 amount,
        string calldata reason
    ) external onlyRole(BURNER_ROLE) {
        _spendAllowance(from, msg.sender, amount);
        _burn(from, amount);
        emit Burned(from, amount, reason);
    }
}
