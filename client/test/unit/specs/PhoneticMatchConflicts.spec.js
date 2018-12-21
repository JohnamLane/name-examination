/*eslint-disable*/
import staticFilesServer from '../static.files.server';
import { createApiSandbox, sinon } from '../../features/specs/support/api.stubs'
import Vue from 'vue';
import Vuelidate from 'vuelidate'
import Datatable from 'vue2-datatable-component'
Vue.use(Vuelidate)
Vue.use(require('vue-shortkey'))
Vue.use(Datatable)
import App from '@/App.vue';
import store from '@/store'
import router from '@/router'

describe('Phonetic-Match Conflicts', () => {

    let data = {};

    beforeEach((done) => {
        data.apiSandbox = createApiSandbox()
        jest.setTimeout(100000);
        staticFilesServer.start(done)
    })
    afterEach((done)=>{
        data.apiSandbox.restore()
        staticFilesServer.stop(done)
    })

    describe('list', ()=>{

        beforeEach((done)=>{
            data.apiSandbox.getStub.withArgs('/api/v1/requests/queues/@me/oldest', sinon.match.any).returns(
                    new Promise((resolve) => resolve({ data: { nameRequest:'NR1234' } }))
            )
            data.apiSandbox.getStub.withArgs('/api/v1/requests/NR1234', sinon.match.any).returns(
                new Promise((resolve) => {
                    resolve({
                        data: {
                            names:[
                                { choice:1, state:'NE', name:'incredible name inc' }
                            ],
                            state: 'INPROGRESS',
                            requestTypeCd: 'CR',
                            applicants: '',
                            nwpta: [],
                            userId: 'Joe'
                        }
                    })
                })
            )
            data.apiSandbox.getStub.withArgs('/api/v1/requests/1', sinon.match.any).returns(
                new Promise((resolve) => resolve({ data: {} }))
            )
            data.apiSandbox.getStub.withArgs('/api/v1/exact-match?query='+encodeURIComponent('incredible name inc'), sinon.match.any).returns(
                new Promise((resolve) => resolve({ data: {
                    names: [
                      { name:'fake exact match', id:'43', source:'moon' }
                    ],
                } }))
            )
            data.apiSandbox.getStub.withArgs('/api/v1/requests/synonymbucket/incredible name inc', sinon.match.any).returns(
                new Promise((resolve) => resolve({ data: {
                    names:[
                      { name:'fake synonym match - meta1', id:'43', source:'moon' }
                    ]
                } }))
            )
            data.apiSandbox.getStub.withArgs('/api/v1/sounds-like?query='+encodeURIComponent('incredible name inc'), sinon.match.any).returns(
                new Promise((resolve) => resolve({ data: {
                    names: [
                        { name:'Incredible Name LTD', id:'42', source:'moon' }
                    ],
                } }))
            )
            data.apiSandbox.getStub.withArgs('/api/v1/requests/42', sinon.match.any).returns(
                new Promise((resolve) => resolve({ data: { names:[] } }))
            )
            const Constructor = Vue.extend(App);
            data.instance = new Constructor({store:store, router:router});
            data.vm = data.instance.$mount(document.getElementById('app'));
            setTimeout(()=>{
                data.instance.$store.state.userId = 'Joe'
                sessionStorage.setItem('AUTHORIZED', true)
                router.push('/nameExamination')
                setTimeout(()=>{
                    done();
                }, 1000)
            }, 1000)
        })

        it('displays phonetic-match conflicts', ()=>{
            expect(data.vm.$el.querySelector('#conflict-list').textContent).toContain('Incredible Name LTD')
        })

        it('displays phonetic-match conflicts last', ()=>{
            var content = data.vm.$el.querySelector('#conflict-list').textContent.trim()

            expect(content.indexOf('fake synonym match')).not.toEqual(-1)
            expect(content.indexOf('Incredible Name LTD')).not.toEqual(-1)
            expect(content.indexOf('Incredible Name LTD') > content.indexOf('fake synonym match')).toEqual(true)
        })

        it('populates additional attributes as expected', ()=>{
            expect(data.instance.$store.state.phoneticMatchesConflicts).toEqual([{ class:"conflict-result conflict-phonetic-match", text:'Incredible Name LTD', nrNumber:'42', source:'moon' }])
        })

        it('resists no phonetic match', (done)=>{
            data.apiSandbox.getStub.withArgs('/api/v1/sounds-like?query='+encodeURIComponent('incredible name inc'), sinon.match.any).returns(
                new Promise((resolve) => resolve({ data: {
                    names: []
                } }))
            )
            const Constructor = Vue.extend(App);
            data.instance = new Constructor({store:store, router:router});
            data.vm = data.instance.$mount(document.getElementById('app'));
            setTimeout(()=>{
                data.instance.$store.state.userId = 'Joe'
                sessionStorage.setItem('AUTHORIZED', true)
                router.push('/nameExamination')
                setTimeout(()=>{
                    expect(data.vm.$el.querySelector('#conflict-list .conflict-no-match').textContent).toEqual('No Match')
                    done();
                }, 1000)
            }, 1000)
        })

        it('changes conflicts tab to red', (done)=>{
            const Constructor = Vue.extend(App);
            data.instance = new Constructor({store:store, router:router});
            data.vm = data.instance.$mount(document.getElementById('app'));
            setTimeout(()=>{
                data.instance.$store.state.userId = 'Joe'
                sessionStorage.setItem('AUTHORIZED', true)
                router.push('/nameExamination')
                setTimeout(()=>{
                    expect(document.getElementById('Conflict1').className).toEqual('icon icon-fail')
                    expect(document.getElementById('Conflict2').className).toEqual('fa fa-times')
                    done();
                }, 1000)
            }, 1000)
        })

        it('defaults to green', (done)=>{
            data.apiSandbox.getStub.withArgs('/api/v1/exact-match?query='+encodeURIComponent('incredible name inc'), sinon.match.any).returns(
                new Promise((resolve) => resolve({ data: {
                    names: [],
                } }))
            )
            data.apiSandbox.getStub.withArgs('/api/v1/requests/synonymbucket/incredible name inc', sinon.match.any).returns(
                new Promise((resolve) => resolve({ data: {
                    names:[]
                } }))
            )
            data.apiSandbox.getStub.withArgs('/api/v1/sounds-like?query='+encodeURIComponent('incredible name inc'), sinon.match.any).returns(
                new Promise((resolve) => resolve({ data: {
                    names: []
                } }))
            )
            const Constructor = Vue.extend(App);
            data.instance = new Constructor({store:store, router:router});
            data.vm = data.instance.$mount(document.getElementById('app'));
            setTimeout(()=>{
                data.instance.$store.state.userId = 'Joe'
                sessionStorage.setItem('AUTHORIZED', true)
                router.push('/nameExamination')
                setTimeout(()=>{
                    expect(document.getElementById('Conflict1').className).toEqual('icon icon-pass')
                    expect(document.getElementById('Conflict2').className).toEqual('fa fa-check')
                    done();
                }, 1000)
            }, 1000)
        })

    })
})
