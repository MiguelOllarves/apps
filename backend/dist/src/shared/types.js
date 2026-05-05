"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UNIT_FACTORS = exports.TransactionType = exports.OrderType = exports.OrderStatus = exports.RecipeType = exports.UnitType = exports.CategoryType = exports.Role = void 0;
var Role;
(function (Role) {
    Role["ADMIN"] = "ADMIN";
    Role["WAREHOUSE"] = "WAREHOUSE";
    Role["KITCHEN"] = "KITCHEN";
    Role["WAITER"] = "WAITER";
    Role["CLIENT"] = "CLIENT";
})(Role || (exports.Role = Role = {}));
var CategoryType;
(function (CategoryType) {
    CategoryType["RAW_MATERIAL"] = "RAW_MATERIAL";
    CategoryType["MENU_ITEM"] = "MENU_ITEM";
})(CategoryType || (exports.CategoryType = CategoryType = {}));
var UnitType;
(function (UnitType) {
    UnitType["G"] = "G";
    UnitType["KG"] = "KG";
    UnitType["LB"] = "LB";
    UnitType["OZ"] = "OZ";
    UnitType["ML"] = "ML";
    UnitType["L"] = "L";
    UnitType["OZ_FL"] = "OZ_FL";
    UnitType["GAL"] = "GAL";
    UnitType["UNIT"] = "UNIT";
    UnitType["PACK"] = "PACK";
    UnitType["DOZEN"] = "DOZEN";
    UnitType["BOX"] = "BOX";
})(UnitType || (exports.UnitType = UnitType = {}));
var RecipeType;
(function (RecipeType) {
    RecipeType["MOTHER_RECIPE"] = "MOTHER_RECIPE";
    RecipeType["SUB_PRODUCT"] = "SUB_PRODUCT";
    RecipeType["FINAL_PRODUCT"] = "FINAL_PRODUCT";
})(RecipeType || (exports.RecipeType = RecipeType = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["KITCHEN"] = "KITCHEN";
    OrderStatus["READY"] = "READY";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["SHIPPED"] = "SHIPPED";
    OrderStatus["CANCELLED"] = "CANCELLED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var OrderType;
(function (OrderType) {
    OrderType["DINE_IN"] = "DINE_IN";
    OrderType["DELIVERY"] = "DELIVERY";
    OrderType["TAKEOUT"] = "TAKEOUT";
})(OrderType || (exports.OrderType = OrderType = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["PURCHASE"] = "PURCHASE";
    TransactionType["SALE"] = "SALE";
    TransactionType["ADJUSTMENT"] = "ADJUSTMENT";
    TransactionType["SHRINKAGE"] = "SHRINKAGE";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
exports.UNIT_FACTORS = {
    G: 1, KG: 1000, LB: 453.59, OZ: 28.35,
    ML: 1, L: 1000, OZ_FL: 29.57, GAL: 3785.41,
    UNIT: 1, DOZEN: 12, PACK: 1, BOX: 1,
};
//# sourceMappingURL=types.js.map