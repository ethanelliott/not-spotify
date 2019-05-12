<template>
    <v-container>
        <v-layout align-center fill-height justify-start row>
            <v-flex shrink>
                <v-img :src="artist_artwork" class="elevation-5 ma-4" v-if="artist_artwork !== null"
                       width="200"></v-img>
            </v-flex>
            <v-flex grow>
                <p class="display-2 font-weight-light">{{artist_name}}</p>
                <p class="subheading">{{artist_genres}}</p>
            </v-flex>
        </v-layout>
        <v-divider class="my-4"></v-divider>
        <p class="display-1 ma-4">Top Songs</p>
        <v-layout align-center fill-height justify-start row>
            <v-flex xs6>
                <v-data-table :headers="artist_top_tracks_headers" :items="artist_top_tracks" flat hide-actions>
                    <template v-slot:items="props">
                        <td>
                            <v-btn @click="playSong(props.item.uri)" fab flat small>
                                <v-icon>play_arrow</v-icon>
                            </v-btn>
                        </td>
                        <td>
                            <v-img :src="props.item.artwork"></v-img>
                        </td>
                        <td>
                            <span @click="playSong(props.item.uri)" class="link">{{ props.item.name }}</span>
                        </td>
                        <td>{{ props.item.album }}</td>
                    </template>
                </v-data-table>
            </v-flex>
            <v-flex xs6>
            </v-flex>
        </v-layout>
        <v-divider class="my-4"></v-divider>
        <p class="display-1 ma-4">Albums</p>
        <v-progress-linear color="primary" v-if="loading_albums" indeterminate></v-progress-linear>
        <v-layout v-if="!loading_albums" fill-height column>
            <v-flex :key="album.id" v-for="(album, index) in artist_albums" class="">
                <v-layout align-content-center justify-center fill-height row class="my-4">
                    <v-flex shrink>
                        <v-img width="150" :src="album.artwork"></v-img>
                    </v-flex>
                    <v-layout grow justify-start align-center fill-height>
                        <p class="title ma-4">{{album.name}}</p>
                    </v-layout>
                </v-layout>
                <v-data-table :headers="artist_album_tracks_headers" :items="album.tracks" flat hide-actions class="my-4">
                    <template v-slot:items="props">
                        <td>
                            <v-btn @click="playSongWithContext(props.index, album.uri)" fab flat small>
                                <v-icon>play_arrow</v-icon>
                            </v-btn>
                        </td>
                        <td>
                            <span @click="playSongWithContext(props.index, album.uri)" class="link">{{ props.item.name }}</span>
                        </td>
                        <td>
                            <router-link tag="span" class="link" v-for="(artist, index) in props.item.artists" :key="artist.id" :to="`/m/artist/${artist.id}`">
                                {{ artist.name }}
                                <span v-if="index < props.item.artists.length - 1">,&nbsp;</span>
                            </router-link>
                        </td>
                    </template>
                </v-data-table>
                <v-divider v-if="index < artist_albums - 1"></v-divider>
            </v-flex>
        </v-layout>
        <v-divider class="my-4"></v-divider>
        <p class="display-1 ma-4">Singles</p>
        <v-progress-linear color="primary" v-if="loading_albums" indeterminate></v-progress-linear>
        <v-layout v-if="!loading_albums" fill-height column>
            <v-flex :key="album.id" v-for="(album, index) in artist_singles" class="">
                <v-layout align-content-center justify-center fill-height row class="my-4">
                    <v-flex shrink>
                        <v-img width="150" :src="album.artwork"></v-img>
                    </v-flex>
                    <v-layout grow justify-start align-center fill-height>
                        <p class="title ma-4">{{album.name}}</p>
                        <!--                        <p class="title ma-4">{{album.artists}}</p>-->
                    </v-layout>
                </v-layout>
                <v-data-table :headers="artist_album_tracks_headers" :items="album.tracks" flat hide-actions class="my-4">
                    <template v-slot:items="props">
                        <td>
                            <v-btn @click="playSongWithContext(props.index, album.uri)" fab flat small>
                                <v-icon>play_arrow</v-icon>
                            </v-btn>
                        </td>
                        <td>
                            <span @click="playSongWithContext(props.index, album.uri)" class="link">{{ props.item.name }}</span>
                        </td>
                        <td>
                            <router-link tag="span" class="link" v-for="(artist, index) in props.item.artists" :key="artist.id" :to="`/m/artist/${artist.id}`">
                                {{ artist.name }}
                                <span v-if="index < props.item.artists.length - 1">,&nbsp;</span>
                            </router-link>
                        </td>
                    </template>
                </v-data-table>
                <v-divider v-if="index < artist_albums - 1"></v-divider>
            </v-flex>
        </v-layout>
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

    const getArtistAlbums = (artistID, token, callback) => {
        let url = `https://api.spotify.com/v1/artists/${artistID}/albums?market=${session.getItem('country')}`
        let album_array = []
        recursiveGetItems(url, token, album_array).then(() => {
            callback(album_array)
        })
    }

    const getMultipleAlbums = (artistID, token, callback) => {
        getArtistAlbums(artistID, token, a_albums => {
            a_albums = a_albums.map(e => e.name)
                .map((e, i, final) => final.indexOf(e) === i && i)
                .filter(e => a_albums[e]).map(e => a_albums[e])
                .filter(e => (e.album_type === "album" || e.album_type === "single") && e.album_group !== "appears_on")
            let numOfReq = Math.ceil(a_albums.length / 20)
            let requestArray = Array(numOfReq).fill('')
            for (let i = 0; i < requestArray.length; i++) {
                let albumIds = a_albums.splice(0, 20).map(e => e.id).reduce((a, b) => `${a}${b},`, ``).slice(0, -1)
                requestArray[i] = get(`https://api.spotify.com/v1/albums?market=${session.getItem('country')}&ids=${albumIds}`, session.getItem('token'))
            }
            Promise.all(requestArray).then(values => {
                let albumArray = []
                values.forEach(e => {
                    albumArray.push(...e.data.albums)
                })
                callback(albumArray)
            })
        })
    }

    export default {
        name: 'Artist',
        props: ['id'],
        data: () => ({
            loading_albums: false,
            artist_uri: null,
            artist_id: null,
            artist_name: null,
            artist_genres: [],
            artist_artwork: null,
            artist_followers: 0,
            artist_top_tracks: [],
            artist_top_tracks_headers: [
                {
                    text: 'Play',
                    value: 'uri',
                    align: 'left',
                    sortable: false,
                    width: "1%"
                },
                {
                    text: 'Artwork',
                    value: 'artwork',
                    align: 'left',
                    sortable: false,
                    width: "1%"
                },
                {
                    text: 'Track',
                    value: 'name',
                    align: 'left',
                    sortable: false

                },
                {
                    text: 'Album',
                    value: 'album',
                    align: 'left',
                    sortable: false

                }
            ],
            artist_album_tracks_headers: [
                {
                    text: 'Play',
                    value: 'uri',
                    align: 'left',
                    sortable: false,
                    width: "1%"
                },
                {
                    text: 'Track',
                    value: 'name',
                    align: 'left',
                    sortable: false

                },
                {
                    text: 'Artist',
                    value: 'artist',
                    align: 'left',
                    sortable: false

                }
            ],
            artist_albums: [],
            artist_singles: []
        }),
        mounted() {
            this.loading_albums = true
            this.loadArtistData(this.id)
        },
        watch: {
            id: function (newVal) {
                this.loading_albums = true
                this.artist_top_tracks = []
                this.artist_albums = []
                this.artist_singles = []
                this.loadArtistData(newVal)
            }
        },
        methods: {
            playSong(uri) {
                axios({
                    method: 'put',
                    url: 'https://api.spotify.com/v1/me/player/play',
                    headers: {
                        'Authorization': 'Bearer ' + session.getItem('token')
                    },
                    data: {
                        uris: [uri]
                    }
                })
            },
            playSongWithContext(position, context) {
                axios({
                    method: 'put',
                    url: 'https://api.spotify.com/v1/me/player/play',
                    headers: {
                        'Authorization': 'Bearer ' + session.getItem('token')
                    },
                    data: {
                        context_uri: context,
                        offset: {position: position}
                    }
                })
            },
            loadArtistData(id) {
                let t = this
                get(`https://api.spotify.com/v1/artists/${id}`, session.getItem('token')).then(res => {
                    t.artist_uri = res.data.uri
                    t.artist_id = res.data.id
                    t.artist_name = res.data.name
                    t.artist_artwork = res.data.images[0].url
                    t.artist_genres = res.data.genres
                    t.artist_followers = res.data.followers.total
                    get(`https://api.spotify.com/v1/artists/${id}/top-tracks?country=${session.getItem('country')}`, session.getItem('token')).then(top_res => {
                        t.artist_top_tracks = top_res.data.tracks.map(e => ({
                            name: e.name,
                            id: e.id,
                            uri: e.uri,
                            album: e.album.name,
                            artwork: e.album.images[0].url
                        }))
                        getMultipleAlbums(id, session.getItem('token'), albums => {
                            t.artist_albums = albums.filter(e => e.album_type === "album").map(e => ({
                                id: e.id,
                                uri: e.uri,
                                name: e.name,
                                artwork: e.images[0].url,
                                artists: e.artists,
                                tracks: e.tracks.items.map(track => ({
                                    name: track.name,
                                    id: track.id,
                                    uri: track.uri,
                                    artists: track.artists.map(e => ({name: e.name, id: e.id}))
                                }))
                            }))
                            t.artist_singles = albums.filter(e => e.album_type === "single").map(e => ({
                                id: e.id,
                                uri: e.uri,
                                name: e.name,
                                artwork: e.images[0].url,
                                artists: e.artists,
                                tracks: e.tracks.items.map(track => ({
                                    name: track.name,
                                    id: track.id,
                                    uri: track.uri,
                                    artists: track.artists.map(e => ({name: e.name, id: e.id}))
                                }))
                            }))
                            this.loading_albums = false
                        })
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
