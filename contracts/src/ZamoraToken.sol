// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ZamoraToken (ZAM)
 * @notice Token de incentivos del campus. Los estudiantes lo ganan por notas,
 *         asistencia y tareas, y lo gastan en recompensas, cursos y foro.
 * @dev Control de acceso por roles. El "system wallet" (backend) y el contrato
 *      ZamoraCampus reciben MINTER_ROLE.
 *
 *      - decimals() = 0: 1 ZAM == 1 unidad entera (la economía usa enteros).
 *      - ERC20Permit (EIP-2612): permite que el estudiante firme un "permit"
 *        sin gas y el backend (relayer) lo envíe. Así el alumno nunca paga gas.
 */
contract ZamoraToken is ERC20, ERC20Permit, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    event Minted(address indexed to, uint256 amount, string reason);
    event Burned(address indexed from, uint256 amount, string reason);

    constructor(
        string memory name_,
        string memory symbol_,
        address admin
    ) ERC20(name_, symbol_) ERC20Permit(name_) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(BURNER_ROLE, admin);
    }

    /// @notice ZAMORA no usa decimales: 1 unidad == 1 token.
    function decimals() public pure override returns (uint8) {
        return 0;
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

    /// @notice Quema ZAMORA de otra cuenta con autorización previa (allowance
    ///         concedida por firma `permit` fuera de cadena).
    function burnFrom(
        address from,
        uint256 amount,
        string calldata reason
    ) external onlyRole(BURNER_ROLE) {
        _spendAllowance(from, msg.sender, amount);
        _burn(from, amount);
        emit Burned(from, amount, reason);
    }

    /// @notice Quema ZAMORA de una cuenta arbitraria sin allowance. Reservado al
    ///         rol BURNER (admin/relayer) para la tesorería (p. ej. ajustes).
    function adminBurn(
        address from,
        uint256 amount,
        string calldata reason
    ) external onlyRole(BURNER_ROLE) {
        _burn(from, amount);
        emit Burned(from, amount, reason);
    }
}
