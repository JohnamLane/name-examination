<!--eslint-disable-->
<template>

    <div class="col conflict-list-parent-col">
      <div class="row conflict-list-view">
        <div id="conflict-list" v-if="conflictData.length > 0"  class="form-control" size="17" border="0"
                tabindex="2" style="overflow-y: scroll; max-height:480px">
          <div v-for="(option, index) in conflictData" :key="option.value" :class="option.class"
            @click="clic(option)"
          >
		  	<template v-if="option.class == 'conflict-synonym-title'">
				<div style="float:left; max-width:80%">
					<span class="conflict-title">{{ option.text }}</span>
					<span class="conflict-meta"> - {{ option.meta }}</span>
				</div>
				<div style="text-align:right; display:block; width:auto">
					{{ option.count }}
					<i class="fa fa-chevron-down" style="background-color:white; color:white" />
				</div>
			</template>
			<template v-else-if="option.class.indexOf('conflict-synonym-title collapsible')==0">
				<div style="float:left; max-width:80%">
					<span class="conflict-title">{{ option.text }}</span>
					<span class="conflict-meta"> - {{ option.meta }}</span>
				</div>
				<div v-if="option.class.indexOf('collapsible collapsed') != -1" style="text-align:right; display:block; width:auto">
					{{ option.count }}
					<i class="fa fa-chevron-down"/>
				</div>
				<div v-else style="text-align:right; display:block; width:auto">
					{{ option.count }}
					<i class="fa fa-chevron-up"/>
				</div>
			</template>
			<template v-else>
				<div>{{ option.text }}</div>
			</template>
		</div>

	</div>
        <div v-else class="empty-list">( No data )</div>

      </div>

    </div>

</template>

<script>
/* eslint-disable */
  export default {
    name: 'ConflictList',
    data: function () {
      return {
        selectedConflict: '',
		conflictEntries: [],
		selection: { class:'' }
      }
    },
    computed: {
      conflictData() {

        var data = [];

        // add Exact Match header
        data = data.concat([{ text: 'Exact Match', class: 'exact-match-title'}]);

        // add Exact Match data
        if (this.$store.getters.exactMatchesConflicts && this.$store.getters.exactMatchesConflicts.length > 0) {
          data = data.concat(this.$store.getters.exactMatchesConflicts);
        }
        else {
          data = data.concat([{ text:'No Exact Match', class: 'conflict-no-match' }]);
        }

        // add Synonym Match header
        data = data.concat([{ text: 'Exact Word Order + Synonym Match', class: 'synonym-match-title'}]);

        // add Synonym Match data
        if (this.$store.getters.synonymMatchesConflicts && this.$store.getters.synonymMatchesConflicts.length) {
          data = data.concat(this.$store.getters.synonymMatchesConflicts);
	  	}
        else
          data = data.concat([{ text:'No Match', class: 'conflict-no-match' }]);

		this.conflictEntries = data

        return data;
      },
    },
    mounted() {
		console.log('ConflictList mounted');
      this.selectedConflict = '';
      this.setSelectedConflict();
    },
    methods: {
		clic(what) {
			if (what.class.indexOf('conflict-synonym-title collapsible') == 0) {
				this.expand_collapse(what)
			}
			if (what.class.indexOf('conflict-result') == 0) {
				this.unselectPreviousSelection()
				what.class += ' conflict-result-selected'
				this.selection = what
				this.selectedConflict = what
				this.check_deselect()
			}
		},
		unselectPreviousSelection() {
			this.selection.class = this.selection.class.replace(' conflict-result-selected', '')
			var entries = this.conflictEntries
			for (let i=0; i<entries.length; i++){
				let entry = entries[i]
				if (entry.class.indexOf('conflict-result') != -1) {
					entry.class = entry.class.replace(' conflict-result-selected', '')
				}
			}
		},
		expand_collapse(what) {
			let toggleIt = false
			for (let i=0; i<this.$store.getters.synonymMatchesConflicts.length; i++){
				let entry = this.$store.getters.synonymMatchesConflicts[i]
				if (entry.class.indexOf('conflict-synonym-title collapsible') == 0){
					if (entry.text == what.text) {
						toggleIt = true
						if (entry.class == 'conflict-synonym-title collapsible collapsed') {
							entry.class = 'conflict-synonym-title collapsible expanded'
						}
						else {
							entry.class = 'conflict-synonym-title collapsible collapsed'
						}
					}
					else {
						toggleIt = false
					}
				}
				if (entry.class.indexOf('conflict-result') != -1 && toggleIt) {
					if (entry.class.indexOf('conflict-result-hidden') != -1) {
						entry.class = entry.class.replace('conflict-result-hidden', 'conflict-result-displayed')
					}
					else {
						entry.class = entry.class.replace('conflict-result-displayed', 'conflict-result-hidden')
					}
				}
			}
		},
      check_deselect() {
        if (this.$store.getters.currentConflict === this.selectedConflict) {
          this.selectedConflict='';
	    }
      },
      setConflictInfo() {
        if (this.selectedConflict != '')
          this.$store.dispatch('getConflictInfo', this.selectedConflict);
      },
      setSelectedConflict() {
        if (this.$store.getters.currentConflict == null && this.conflictData &&
          this.conflictData.length > 1 && this.conflictData[1].source
        ) {
          this.selectedConflict = {
              index:1,
			  class:this.conflictData[1].class,
              text:this.conflictData[1].text,
              source:this.conflictData[1].source,
              nrNumber:this.conflictData[1].nrNumber
          }
        }
        else if (this.$store.getters.currentConflict != null) {
          this.selectedConflict = this.$store.getters.currentConflict;
	  	}
      }

    },
    watch: {
      selectedConflict: {
        handler(value) {
          console.log('selectedConflict watcher fired: ', value)
          if (value && value.source)
            this.$store.commit('currentConflict', value);
          else
            this.$store.commit('currentConflict', null);
          this.setConflictInfo();
        }
      },
      conflictData: {
        handler() {
          console.log('conflict data watcher fired')
          this.$store.commit('currentConflict', null);
          this.setSelectedConflict();
        }
      }
    }
  }
</script>

<style scoped>
  .conflict-list-parent-col {
    min-width: 800px;
  }

  .conflict-list-view {
    padding: 0 10px;
    height: 100%;
  }

  .exact-match-title, .synonym-match-title {
    background-color: #dedede;
    font-weight: bold;
    padding: 8px 5px;
    color: black;
  }
  .synonym-match-title {
    margin-top: 10px;
  }

  .conflict-synonym-title {
    padding: 5px;
    margin-top: 5px;
    text-transform: uppercase;
    color: black;
  }

  .conflict-result, .conflict-no-match {
    padding: 5px;
    padding-left: 40px;
  }

  .conflict-no-match {
    color: #CCC;
  }

  .conflict-result {
    color: #38598a;
  }

  .conflict-exact-match {
    color: red;
    font-weight: bold;
  }

  .conflict-result-displayed {
	  display:block
  }
  .conflict-result-hidden {
	  display:none
  }
  .conflict-result-selected {
	  background-color: #3979bd;
	  color: white;
  }
  .conflict-title {
	  font-weight:bold;
  }
  .conflict-meta {
	  text-transform:lowercase;
  }
  .fa-chevron-up, .fa-chevron-down {
	  font-size: 12px;
  }


  /* when selected, highlight synonym matches in blue */
  #conflict-list option.conflict-result:checked {
    background: #b3d9ff linear-gradient(0deg, #b3d9ff 0%, #b3d9ff 100%);
  }
  #conflict-list:focus option.conflict-result:checked {
    background: #3979bd linear-gradient(0deg, #3979bd 0%, #3979bd 100%);
  }
  /* when selected, highlight exact match in red */
  #conflict-list option.conflict-exact-match:checked {
    background: #ff9999 linear-gradient(0deg, #ff9999 0%, #ff9999 100%);
  }
  #conflict-list:focus option.conflict-exact-match:checked {
    background: red linear-gradient(0deg, red 0%, red 100%);
  }

  h3, h2 {
    font-size: 15px;
  }

  p {
    font-size: 14px;
  }

</style>
