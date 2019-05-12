<template>
    <v-app dark>
        <v-dialog max-width="500" persistent v-model="dialog">
            <v-card>
                <v-card-title>
                    <span class="headline">{{user_name}}</span>
                    <v-spacer></v-spacer>
                    <v-btn fab flat @click="hideDialog">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text>
                    <v-container fill-height fluid>
                        <v-layout align-center justify-center>
                            <v-img v-if="user_image !== '' && user_image !== null" max-width="150" :src="user_image"></v-img>
                        </v-layout>
                    </v-container>
                    <v-btn block color="primary" dark large to="/logout">
                        Logout
                    </v-btn>
                </v-card-text>
            </v-card>
        </v-dialog>
        <v-navigation-drawer clipped app fixed floating v-model="drawer">
            <v-container>
                <v-list>
                    <v-list-tile ripple avatar to="/m/home">
                        <v-list-tile-avatar>
                            <v-icon>home</v-icon>
                        </v-list-tile-avatar>
                        <v-list-tile-content>
                            <v-list-tile-title>Home</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                    <v-list-tile ripple avatar to="/m/search">
                        <v-list-tile-avatar>
                            <v-icon>search</v-icon>
                        </v-list-tile-avatar>
                        <v-list-tile-content>
                            <v-list-tile-title>Search</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                </v-list>
                <p class="headline">Playlists</p>
                <v-list>
                    <template v-for="(item) in user_playlists">
                        <v-list-tile :key="item.id + (new Date()).valueOf()" ripple :to="`/m/playlist/${item.id}`">
                            <v-list-tile-content>
                                <v-list-tile-title>{{ item.name }}</v-list-tile-title>
                            </v-list-tile-content>
                        </v-list-tile>
                    </template>
                </v-list>
            </v-container>
        </v-navigation-drawer>
        <v-toolbar app dark clipped-left>
            <v-icon color="primary">music_note</v-icon>
            <v-toolbar-title class="headline text-uppercase">
                <span>Not</span>
                <span class="font-weight-light">Spotify</span>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn fab flat @click="showDialog">
                <v-icon>account_circle</v-icon>
            </v-btn>
        </v-toolbar>
        <v-content>
            <router-view name="content"></router-view>
        </v-content>
        <v-footer app cliped-left fixed height="auto">
            <v-card class="flex" flat color="black">
                <v-layout align-center justify-space-around row fill-height>
                    <v-flex xs4 class="text-xs-left">
                        <v-layout align-center justify-start row fill-height>
                            <v-flex shrink>
                                <v-img width="80" class="elevation-5 ma-3" v-if="current_artwork !== null" :src="current_artwork"></v-img>
                            </v-flex>
                            <v-flex grow>
                                <p class="title">{{current_song_name}}</p>
                                <p class="subheading font-italic">{{current_song_artist}}</p>
                            </v-flex>
                        </v-layout>
                    </v-flex>
                    <v-flex xs4 class="ma-3 text-xs-center">
                        <v-flex>
                            <v-btn fab flat small @click="toggleShuffle">
                                <v-icon>shuffle</v-icon>
                            </v-btn>
                            <v-btn fab flat small @click="skipPrevious">
                                <v-icon>skip_previous</v-icon>
                            </v-btn>
                            <v-btn fab color="primary" small @click="togglePlay">
                                <v-icon v-if="current_play_state">pause</v-icon>
                                <v-icon v-else>play_arrow</v-icon>
                            </v-btn>
                            <v-btn fab flat small @click="skipNext">
                                <v-icon>skip_next</v-icon>
                            </v-btn>
                            <v-btn fab flat small @click="toggleLoop">
                                <v-icon>loop</v-icon>
                            </v-btn>
                        </v-flex>
                        <v-flex>
                            <v-progress-linear v-model="current_track_percent"></v-progress-linear>
                        </v-flex>
                    </v-flex>
                    <v-flex xs4 class="ma-3 text-xs-right">

                    </v-flex>
                </v-layout>
            </v-card>
        </v-footer>
    </v-app>
</template>

<script>
    import session from 'localStorage'
    import axios from 'axios'

    const get = async (url, token) => {
        return await axios({
            method: 'get',
            url: url,
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
    }

    const recursiveGetItems = (url, token, array) => {
        return get(url, token).then(data => {
            array.push(...data.data.items)
            if (data.data.next !== null) {
                return recursiveGetItems(data.data.next, token, array)
            }
        })
    }

    const getUserPlaylists = (token, callback) => {
        let url = `https://api.spotify.com/v1/me/playlists`
        let playlist_array = []
        recursiveGetItems(url, token, playlist_array).then(() => {
            callback(playlist_array)
        })
    }

    export default {
        name: 'Layout',
        data: () => ({
            player: null,
            device_id: null,
            drawer: null,
            dialog: null,
            user_name: null,
            user_image: null,
            eventLoop: null,
            playlistEventLoop: null,
            current_play_state: false,
            current_track_percent: 0,
            current_artwork: null,
            current_song_name: null,
            current_song_artist: null,
            user_playlists: [],
            search: ''
        }),
        beforeDestroy() {
            clearInterval(this.eventLoop)
            clearInterval(this.playlistEventLoop)
            this.player.disconnect()
        },
        mounted() {
            let t = this
            t.user_name = session.getItem('name')
            t.user_image = session.getItem('simg')
            t.playlistEventLoop = setInterval(() => {
                getUserPlaylists(session.getItem('token'), (playlists) => {
                    t.user_playlists = playlists
                })
            }, 5000)
            t.eventLoop = setInterval(() => {
                axios({
                    method: 'get',
                    url: `https://api.spotify.com/v1/me/player/currently-playing?market=${session.getItem('country')}`,
                    headers: {
                        'Authorization': 'Bearer ' + session.getItem('token')
                    }
                }).then(res => {
                    t.current_play_state = res.data.is_playing
                    t.current_track_percent = (res.data.progress_ms / res.data.item.duration_ms) * 100
                    t.current_artwork = res.data.item.album.images[0].url
                    t.current_song_name = res.data.item.name
                    t.current_song_artist = res.data.item.artists.map(e => e.name).reduce((a, b) => `${a}${b}, `, ``).slice(0, -2)
                }).catch(err => {
                    console.log(err)
                })
            }, 1000)
            window.onSpotifyWebPlaybackSDKReady = () => {
                const token = session.getItem('token')
                t.player = new Spotify.Player({
                    name: 'NotSpotify',
                    getOAuthToken: cb => { cb(token); }
                });
                // Error handling
                t.player.addListener('initialization_error', ({ message }) => { console.error(message); });
                t.player.addListener('authentication_error', ({ message }) => { console.error(message); });
                t.player.addListener('account_error', ({ message }) => { console.error(message); });
                t.player.addListener('playback_error', ({ message }) => { console.error(message); });
                // Playback status updates
                t.player.addListener('player_state_changed', state => { console.log(state); });
                // Ready
                t.player.addListener('ready', ({ device_id }) => {
                    console.log('Ready with Device ID', device_id);
                    axios({
                        method: 'put',
                        url: 'https://api.spotify.com/v1/me/player',
                        headers: {
                            'Authorization': 'Bearer ' + session.getItem('token')
                        },
                        data: {
                            device_ids: [device_id],
                            play: false
                        }
                    }).then(res => {
                        console.log(res)
                    }).catch(err => {
                        console.log(err)
                    })
                });
                // Not Ready
                t.player.addListener('not_ready', ({ device_id }) => {
                    console.log('Device ID has gone offline', device_id);
                });
                // Connect to the player!
                t.player.connect();
            };
        },
        methods: {
            showDialog() {
                this.dialog = true
            },
            hideDialog() {
                this.dialog = false
            },
            toggleShuffle() {

            },
            toggleLoop() {

            },
            togglePlay() {
                if (this.current_play_state) {
                    axios({
                        method: 'put',
                        url: 'https://api.spotify.com/v1/me/player/pause',
                        headers: {
                            'Authorization': 'Bearer ' + session.getItem('token')
                        }
                    })
                } else {
                    axios({
                        method: 'put',
                        url: 'https://api.spotify.com/v1/me/player/play',
                        headers: {
                            'Authorization': 'Bearer ' + session.getItem('token')
                        }
                    })
                }
            },
            skipPrevious() {
                axios({
                    method: 'post',
                    url: 'https://api.spotify.com/v1/me/player/previous',
                    headers: {
                        'Authorization': 'Bearer ' + session.getItem('token')
                    }
                })
            },
            skipNext() {
                axios({
                    method: 'post',
                    url: 'https://api.spotify.com/v1/me/player/next',
                    headers: {
                        'Authorization': 'Bearer ' + session.getItem('token')
                    }
                })
            },
            openPlaylist(playlistID) {
                this.$router.push(`/m/playlist/${playlistID}`)
            }
        }
    }
</script>
