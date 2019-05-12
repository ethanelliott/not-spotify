<template>
    <v-app dark>
        <v-content>
        </v-content>
    </v-app>
</template>

<script>
    import session from 'localStorage'

    export default {
        name: "Logout",
        data: () => ({}),
        mounted() {
            let t = this
            session.clear()
            setTimeout(() => {
                t.$router.push('/')
            }, 0)
        }
    }
</script>
