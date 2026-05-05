export declare enum Role {
    ADMIN = "ADMIN",
    WAREHOUSE = "WAREHOUSE",
    KITCHEN = "KITCHEN",
    WAITER = "WAITER",
    CLIENT = "CLIENT"
}
export declare enum CategoryType {
    RAW_MATERIAL = "RAW_MATERIAL",
    MENU_ITEM = "MENU_ITEM"
}
export declare enum UnitType {
    G = "G",
    KG = "KG",
    LB = "LB",
    OZ = "OZ",
    ML = "ML",
    L = "L",
    OZ_FL = "OZ_FL",
    GAL = "GAL",
    UNIT = "UNIT",
    PACK = "PACK",
    DOZEN = "DOZEN",
    BOX = "BOX"
}
export declare enum RecipeType {
    MOTHER_RECIPE = "MOTHER_RECIPE",
    SUB_PRODUCT = "SUB_PRODUCT",
    FINAL_PRODUCT = "FINAL_PRODUCT"
}
export declare enum OrderStatus {
    PENDING = "PENDING",
    KITCHEN = "KITCHEN",
    READY = "READY",
    DELIVERED = "DELIVERED",
    SHIPPED = "SHIPPED",
    CANCELLED = "CANCELLED"
}
export declare enum OrderType {
    DINE_IN = "DINE_IN",
    DELIVERY = "DELIVERY",
    TAKEOUT = "TAKEOUT"
}
export declare enum TransactionType {
    PURCHASE = "PURCHASE",
    SALE = "SALE",
    ADJUSTMENT = "ADJUSTMENT",
    SHRINKAGE = "SHRINKAGE"
}
export declare const UNIT_FACTORS: Record<string, number>;
export interface CategoryResponse {
    id: string;
    name: string;
    type: CategoryType;
    tenantId: string;
}
export interface RawMaterialResponse {
    id: string;
    name: string;
    unit: UnitType;
    currentStock: number;
    minStockAlert: number;
    baseCost: number;
    replacementCost: number;
    yieldPercentage: number;
    shrinkagePercentage: number;
    categoryId: string;
    tenantId: string;
    updatedAt: string;
    category?: CategoryResponse;
}
export interface RecipeIngredientResponse {
    id: string;
    recipeId: string;
    rawMaterialId: string | null;
    subRecipeId: string | null;
    quantity: number;
    unit: string;
    rawMaterial?: RawMaterialResponse | null;
    subRecipe?: RecipeResponse | null;
}
export interface RecipeResponse {
    id: string;
    name: string;
    description: string | null;
    type: RecipeType;
    genericCost: number;
    tenantId: string;
    ingredients: RecipeIngredientResponse[];
    menuItem?: MenuItemResponse | null;
}
export interface MenuItemResponse {
    id: string;
    recipeId: string;
    categoryId: string;
    price: number;
    currencyId: string;
    isAvailable: boolean;
    tenantId: string;
    recipe?: RecipeResponse;
    category?: CategoryResponse;
}
export interface CurrencyResponse {
    id: string;
    code: string;
    exchangeRate: number;
    isBaseCurrency: boolean;
    tenantId?: string;
}
export interface OrderItemResponse {
    id: string;
    orderId: string;
    menuItemId: string;
    quantity: number;
    unitPrice: number;
    subTotal: number;
    menuItem?: MenuItemResponse;
}
export interface UserResponse {
    id: string;
    name: string;
    email: string;
    role: Role;
    tenantId: string;
    phone: string | null;
    notes: string | null;
    createdAt: string;
}
export interface OrderResponse {
    id: string;
    userId: string | null;
    customerId: string | null;
    status: OrderStatus;
    type: OrderType;
    tableNumber: string | null;
    totalAmount: number;
    currencyId: string;
    createdAt: string;
    tenantId: string;
    items: OrderItemResponse[];
    user?: UserResponse | null;
}
export interface CustomerResponse {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    address: string | null;
    tenantId: string;
    createdAt: string;
}
export interface DashboardMetrics {
    daySales: number;
    dayProfit: number;
    stockAlertsCount: number;
    stockAlerts: RawMaterialResponse[];
    salesTrend: {
        date: string;
        sales: number;
    }[];
    growthPercentage: number;
    pendingOrdersCount: number;
}
export interface CustomerMetrics {
    customer: UserResponse;
    totalOrders: number;
    totalSpent: number;
    history: OrderResponse[];
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface LoginResponse {
    id: string;
    email: string;
    name: string;
    role: Role;
    tenantId: string;
}
export interface RegisterRequest {
    tenantName: string;
    userName: string;
    email: string;
    password: string;
}
export interface RegisterResponse {
    success: boolean;
    tenantId: string;
    message: string;
}
export interface ControlTotalSession {
    user?: {
        id?: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
    tenantId: string;
    role: Role;
    expires: string;
}
