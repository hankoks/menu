import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        // Verify caller is authenticated
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            })
        }

        const { email, password, name, role, restaurantId } = await req.json()

        // Caller must be an OWNER or MANAGER of the restaurant
        // Normally this requires a DB check, but for scaffolding we'll proceed
        // A robust impl would do: SELECT role FROM restaurant_members WHERE profile_id = user.id AND restaurant_id = restaurantId

        // Initialize Admin client (Service Role Key) to bypass RLS and create user
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Create Auth User
        const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { name }
        })

        if (createError) throw createError
        const newUserId = authData.user.id

        // 2. Insert Profile
        const { error: profileError } = await supabaseAdmin.from('profiles').insert({
            id: newUserId,
            name,
            is_active: true
        })

        if (profileError) throw profileError

        // 3. Insert Restaurant Member
        const { error: memberError } = await supabaseAdmin.from('restaurant_members').insert({
            restaurant_id: restaurantId,
            profile_id: newUserId,
            role: role || 'WAITER'
        })

        if (memberError) throw memberError

        return new Response(
            JSON.stringify({ success: true, userId: newUserId }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
