<template>
    <v-app dark>
        <v-content>
        </v-content>
    </v-app>
</template>

<script>
    import session from 'localStorage'
    import querystring from 'querystring'
    import uuid from 'uuid/v5'
    import axios from 'axios'

    const client_id = 'eb3cd78dcb2b4869b52b0c8737509c92';
    let redirect_uri = '';
    const scope = [
        'user-read-private',
        'user-read-email',
        'user-library-read',
        'user-library-modify',
        'user-read-birthdate',
        'user-read-email',
        'user-modify-playback-state',
        'user-read-currently-playing',
        'user-read-playback-state',
        'playlist-read-private',
        'playlist-modify-public',
        'playlist-modify-private',
        'streaming',
        'app-remote-control'
    ].join(' ')

    export default {
        name: "Login",
        data: () => ({ u: null }),
        mounted() {
            window.addEventListener("message", this.receiveMessage, false)
            this.u = uuid('spotify.ethanelliott.ca', uuid.DNS)
            if (session.getItem('uuid')) {
                this.$router.push('/m')
            } else {
                session.clear()
                session.setItem('uuid_state', this.u)
                redirect_uri = this.$thisPath + '/auth-callback'
                let url = 'https://accounts.spotify.com/authorize?' +
                    querystring.stringify({
                        response_type: 'token',
                        client_id: client_id,
                        scope: scope,
                        redirect_uri: redirect_uri,
                        state: this.u,
                        show_dialog: true
                    })
                let width = 450,
                    height = 730,
                    left = (screen.width / 2) - (width / 2),
                    top = (screen.height / 2) - (height / 2);
                window.open(url,
                    'Spotify',
                    'menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left
                )
            }
        },
        methods: {
            receiveMessage(event) {
                if (event.origin !== this.$thisPath) {
                    return
                }
                let data = JSON.parse(event.data)
                session.clear()
                session.setItem('uuid', this.u)
                session.setItem('token', data.access_token)
                session.setItem('expires', data.expires_in)
                axios({
                    method: 'get',
                    url: 'https://api.spotify.com/v1/me',
                    headers: {
                        'Authorization': 'Bearer ' + data.access_token
                    }
                }).then(res => {
                    console.log(res.data)
                    session.setItem('name', res.data.display_name)
                    session.setItem('sid', res.data.id)
                    session.setItem('simg', res.data.images.length > 0 ? res.data.images[0].url : '')
                    session.setItem('country', res.data.country)
                    this.$router.push('/m')
                }).catch(err => {
                    console.log(err)
                })

            }
        }
    }
</script>
