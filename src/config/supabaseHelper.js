import { supabase } from './supabaseClient';

// Helper to ensure a default restaurant exists and return its ID
export const getDefaultRestaurantId = async () => {
    try {
        const { data, error } = await supabase.from('restaurants').select('id').limit(1).single();
        if (data) return data.id;

        // If none exists, create a default one
        const res = await supabase.from('restaurants').insert({ name: 'Le Jardin (Default)' }).select('id').single();
        return res.data?.id || null;
    } catch (e) {
        console.error("Erreur lors de la récupération du restaurant:", e);
        return null;
    }
};

// Helper to map a string table (e.g. "1") to a UUID table record, creating it if needed
export const getOrEnsureTableId = async (restaurantId, tableString) => {
    if (!restaurantId || !tableString || tableString === 'À emporter') return null;

    // Attempt parse to integer, if fail, fallback to null
    const number = parseInt(tableString.replace(/\D/g, ''), 10);
    if (isNaN(number)) return null;

    try {
        let { data } = await supabase.from('tables').select('id').eq('restaurant_id', restaurantId).eq('number', number).single();
        if (data) return data.id;

        // Create table
        const res = await supabase.from('tables').insert({ restaurant_id: restaurantId, number }).select('id').single();
        return res.data?.id || null;
    } catch (e) {
        console.error("Erreur table:", e);
        return null;
    }
};

// Main function to push an order to Supabase
export const pushOrderToSupabase = async (cart, subtotals, tableStr, note, localOrderId) => {
    try {
        const rid = await getDefaultRestaurantId();
        if (!rid) return null;

        const tableId = await getOrEnsureTableId(rid, tableStr);

        // 1. Insert Order
        const { data: orderData, error: orderError } = await supabase.from('orders').insert({
            restaurant_id: rid,
            table_id: tableId,
            subtotal: subtotals.cartTotal,
            service_fee: subtotals.serviceFee,
            total: subtotals.grandTotal,
            status: 'pending',
            note: note ? `[Local ID: ${localOrderId}] ` + note : `[Local ID: ${localOrderId}]`
        }).select('id').single();

        if (orderError || !orderData) throw orderError;
        const dbOrderId = orderData.id;

        // 2. Insert Order Items (Snapshots)
        const itemsToInsert = cart.map(item => ({
            order_id: dbOrderId,
            menu_item_id: null, // For now, we rely on snapshots as the menu isn't fully seeded yet
            name_snapshot: item.name,
            variant_snapshot: item.variantName || null,
            extras_snapshot: item.extras || [],
            unit_price: item.price,
            quantity: item.quantity,
            total_price: item.price * item.quantity
        }));

        await supabase.from('order_items').insert(itemsToInsert);

        return dbOrderId;
    } catch (e) {
        console.error("Erreur pushOrderToSupabase:", e);
        return null;
    }
};

// Update order status in DB
export const updateOrderStatusInDB = async (localOrderId, newStatus) => {
    // We embedded localOrderId in the note field for quick backwards compatibility tracing
    // A more robust implementation would use a proper bridging ID.
    try {
        const { data } = await supabase.from('orders').select('id').like('note', `%[Local ID: ${localOrderId}]%`).single();
        if (data?.id) {
            await supabase.from('orders').update({ status: newStatus }).eq('id', data.id);
        }
    } catch (e) {
        console.error("Erreur maj statut DB:", e);
    }
};
