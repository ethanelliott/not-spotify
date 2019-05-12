<template>
    <v-container>
        <v-layout align-center justify-start row fill-height>
            <v-flex shrink>
                <v-img width="150" class="elevation-5 ma-4" v-if="playlist_artwork !== null" :src="playlist_artwork"></v-img>
            </v-flex>
            <v-flex grow>
                <p class="title">{{playlist_name}}</p>
                <p class="subheading">{{playlist_description}}</p>
                <p class="subheading">Tracks: {{playlist_total_tracks}}</p>
            </v-flex>
        </v-layout>
        <v-progress-linear color="primary" v-if="loading" indeterminate></v-progress-linear>
        <v-data-table v-if="!loading" flat :items="playlist_tracks" hide-actions hide-headers>
            <template v-slot:items="props">
                <td><v-btn flat fab small @click="playSong(props.item.offset)">
                    <v-icon>play_arrow</v-icon>
                </v-btn></td>
                <td>
                    <span class="link" @click="playSong(props.item.offset)">{{ props.item.name }}</span>
                </td>
                <td>
                    <router-link tag="span" class="link" v-for="(artist, index) in props.item.artist" :key="artist.id" :to="`/m/artist/${artist.id}`">
                        {{ artist.name }}
                        <span v-if="index < props.item.artist.length - 1">,&nbsp;</span>
                    </router-link>
                </td>
                <td>{{ props.item.album }}</td>
            </template>
        </v-data-table>
    </v-container>
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

    const getPlaylistSongs = (playlistID, token, callback) => {
        let url = `https://api.spotify.com/v1/playlists/${playlistID}/tracks`
        let playlist_array = []
        recursiveGetItems(url, token, playlist_array).then(() => {
            callback(playlist_array)
        })
    }

    export default {
        name: 'Playlist',
        props: ['id'],
        data: () => ({
            playlist_context_uri: '',
            playlist_name: '',
            playlist_artwork: null,
            playlist_description: '',
            playlist_followers: 0,
            playlist_owner: {},
            playlist_total_tracks: 0,
            playlist_tracks: [],
            loading: false
        }),
        mounted() {
            this.loading = true
            this.loading = true
            this.loadArtistData(this.id)
        },
        watch: {
            id: function (newVal) {
                this.loading = true
                this.playlist_tracks = []
                this.loadArtistData(newVal)
            }
        },
        methods: {
            playSong(offset) {
                let t = this
                axios({
                    method: 'put',
                    url: 'https://api.spotify.com/v1/me/player/play',
                    headers: {
                        'Authorization': 'Bearer ' + session.getItem('token')
                    },
                    data: {
                        context_uri: t.playlist_context_uri,
                        offset: {
                            position: offset
                        },
                    }
                })
            },
            loadArtistData(id) {
                let t = this
                get(`https://api.spotify.com/v1/playlists/${id}?market=${session.getItem('country')}`, session.getItem('token')).then(res => {
                    t.playlist_context_uri = res.data.uri
                    t.playlist_name = res.data.name
                    t.playlist_description = res.data.description
                    t.playlist_owner = res.data.owner
                    t.playlist_followers = res.data.followers.total
                    t.playlist_total_tracks = res.data.tracks.total
                    t.playlist_artwork = res.data.images[0].url
                    getPlaylistSongs(id, session.getItem('token'), (tracks) => {
                        t.playlist_tracks = tracks.map((e, i) => ({
                            offset: i,
                            id: e.track.id,
                            uri: e.track.uri,
                            name: e.track.name,
                            artist: e.track.artists.map(e => ({name: e.name, id: e.id})),
                            album: e.track.album.name,
                            album_id: e.track.album.id
                        }))
                        this.loading = false
                    })
                })
            }
        }
    }
</script>

<style>
    .link {
        cursor: pointer;
    }
</style>
