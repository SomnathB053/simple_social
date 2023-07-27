const dashboard = Vue.component('dashboard', {
    template: `
    <div>
	<div class="container">
        <div class ="row justify-content-center"><div class="col-10">

        <div class="row">
           <div style="background-color:	#797ef6; background-image: linear-gradient(to right, #2b65ec, #ebfcff); padding: 15px ">  
               <a  style="float:right; margin-top:20px;  margin-left:20px" href="/logout"  role="button"><h4><i class="bi bi-box-arrow-right"></i></h4></a>
               <h5 style="float:right; margin-top:20px;  margin-left:20px; cursor:pointer;" @click="profile(username)"> <i class="bi bi-person-circle"></i> {{ username }}</h5> 
               <h5 style="float:right; margin-top:20px;  margin-left:20px; cursor:pointer;" @click="search()"><i class="bi bi-search"></i></h5>
               <h5 style="float:right; margin-top:20px;  margin-left:20px; cursor:pointer;" @click="expt_window()"> <i class="bi bi-file-earmark-spreadsheet"></i> </h5>
               <h5 style="float:right; margin-top:20px;  margin-left:20px; cursor:pointer;" @click="settings()"> <i class="bi bi-gear"></i> </h5>
               <h2 class="display-5"> <i class="bi bi-house-door"></i> Feed  </h2>                
            </div>
        </div>

        <div class="row justify-content-center" style="margin-top:40px; margin-bottom: 20px;"><div class="col-10">
          <div >
            <input type="text" class="form-control" placeholder="Wanna share something?..." @click="new_post" >
            
          </div>
        </div></div>
      <div id= "oops message"> </div>
        <div v-for="t in record">
            <div class="row" style="padding: 30px">
                <div class="col-sm-12">
                  <div class="card">
                    <div class="card-body">
                      <p style="margin-bottom:20px;color:#00008b; cursor:pointer; width:fit-content" @click="profile(t.username)"><b> @{{ t["username"] }} </b></p>
                      <h5  class="card-title" v-html="t.caption"></h5>
                      <p class="card-text" v-html="t.body"></p>
                      <div class="row justify-content-center">
                      <img  style="max-height:600px;max-width:500px;border-radius:30px " :src= "t.image" class="col-sm-6 ">
                      </div>
                      
                      
                    </div>
                  </div>
                </div>
           </div>
        </div>
        
        <div style="text-align:center">
        <h3>
        <div style="display: inline-block;cursor:pointer;"  @click="previous_page"> <i class="bi bi-caret-left-fill"></i></div>
       <div style="display: inline-block;cursor:pointer;"  @click="next_page"> <i class="bi bi-caret-right-fill"></i> </div>
       </h3>
       </div>
       


<div class="modal" id="modal1" tabindex="-1" @click.self="close">
  <div class="modal-content">
    <h3> Search other users! </h3>
            <div class="input-group mb-3" style="margin-top: 30px">
            <span class="input-group-text" id="basic-addon1">@</span>
            <input type="text" class="form-control" placeholder="username" v-model="src_user">
            <button class="btn btn-outline-info" type="button" id="button-addon2" @click="find_user">Search</button>
            </div>
          
          <div v-if="src_result != null" ><div v-for="item in src_result" style="margin-top:20px;" class="row align-items-center" > 
          <div class="col"><div @click="profile(item.user)"> {{item["user"]}} </div></div> 
          <div class="col-1"><button v-if="item.status == 0"class="btn btn-info" style="float:right" @click="follow_user(item.user); item.status=1" > Follow </button> 
          <button v-if="item.status == 1"class="btn btn-outline-info" style="float:right" @click="unfollow_user(item.user); item.status=0" > Unfollow </button> </div>
          </div>
          <p v-if="src_result != null" style="text-align:center;cursor:pointer;" @click="load_src">Load more results</p>
          </div> 
          <div id= "no_result"></div>
          
          </div>
      </div>
  </div>
</div>
      
<div class="modal" id="modal2" tabindex="-1" @click.self="close">
    <div class="modal-content">
      <h3> Export info </h3>
      <div class="form-check">
      <input class="form-check-input" type="radio" value="one" id="check0" v-model="expt_period">
      <label class="form-check-label" for="check0">One month</label>
      </div>
      <div class="form-check">
      <input class="form-check-input" type="radio" value="six" id="check1" v-model="expt_period">
      <label class="form-check-label" for="check1">Six months</label>
      </div>
      <div class="form-check">
      <input class="form-check-input" type="radio" value="all" id="check2" v-model="expt_period" checked>
      <label class="form-check-label" for="check2">All time </label>
      </div>
      <div>
      <button class="btn btn-info" style="margin-top:20px" @click="export_csv"> Export </button> 
      </div>
    </div>
</div>


 </div>  
  </div>



	 </div>

    </div>
    `,
	data: function() {
        return {
            username: null,
            record: null,
            src_result:null,
            page: 1,
            src_page: 1,
            src_user :null,
            expt_period: null
		}
        },
	methods: {
        next_page: function(){
            this.page = this.page+1;
            fetch('http://127.0.0.1:5000/api/feed/'+this.username+'?page='+this.page, {headers: { 'Content-Type': 'application/json', 'Authentication-Token': sessionStorage.getItem('auth_token')}} )
            .then(resp => resp.json())
            .then(data => {
              if(data != null){
              this.record = data;
              document.documentElement.scrollTop = 0;
              }
              else{
                this.page = this.page-1;
                alert("No more posts!");
              }
            })
            .catch(err => console.log(err.message))
        },
        previous_page: function(){
          if( this.page >1){
          this.page = this.page-1;
          fetch('http://127.0.0.1:5000/api/feed/'+this.username+'?page='+this.page, {headers: { 'Content-Type': 'application/json', 'Authentication-Token': sessionStorage.getItem('auth_token')}} )
          .then(resp => resp.json())
          .then(data => {
            this.record = data;
            document.documentElement.scrollTop = 0;
            })
          .catch(err => console.log(err.message))
         }
      },
        search:function(){
          msg = document.getElementById("no_result");
          msg.innerHTML = null;
          var modal = document.getElementById("modal1");
          modal.style.display= "block";
        },
        close:function(){
          var modal = document.querySelectorAll(".modal");
          modal[0].style.display= "none";
          modal[1].style.display= "none";
          this.src_user = null;
          this.src_result =null;
          this.expt_period =null;        
        },
        find_user:function(){
          this.src_result = null;
          msg = document.getElementById("no_result");
          msg.innerHTML = null;
          this.src_page =1
          fetch('http://127.0.0.1:5000/api/src/'+this.src_user+'?page=1', {headers: { 'Content-Type': 'application/json', 'Authentication-Token': sessionStorage.getItem('auth_token')}} )
          .then(resp => resp.json())
          .then(data => {
            console.log(data)
            if(data != null && data.length >0){
              this.src_result = data;
            }
            else{
              msg = document.getElementById("no_result")
              msg.innerHTML = '<b> Your search has no matches <b>'
            }
          })
          .catch(err => console.log(err.message))
        },
       unfollow_user(user){
        fetch('http://127.0.0.1:5000/api/following/'+ this.username + '/' + user, {
          method: 'DELETE',
          headers: {
            'Authentication-Token': sessionStorage.getItem('auth_token')
          }
        })
        .then(resp => resp.json())
        .then(data => console.log(data))
        .catch(error => console.log(error.message))
       },
        follow_user:async function(user){
            await fetch('http://127.0.0.1:5000/api/following', {
              method: 'POST',
              headers: {
                'Authentication-Token': sessionStorage.getItem('auth_token'),
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ 'follower': this.username, 'followed': user})
            })
            .then(resp => resp.json())
            .then(data => console.log(data))
              .catch(err => console.log(err.message))
        },
        profile:function(user){
            //this.$router.push({name:"profile", params: {"username": user, "logged_as": this.username}});
            this.$router.replace({name:"profile", params: {"username": user, "logged_as": this.username}});

        },    
        new_post:function(){
          //this.$router.push({name:"new_post", params: {"username": this.username}});
          this.$router.replace({name:"new_post", params: {"username": this.username}});
        },
        settings: function(){
          //this.$router.push({name: 'settings', params: { "username": this.username}});
          this.$router.replace({name: 'settings', params: { "username": this.username}});
        },
        expt_window:function(){
          var modal = document.getElementById("modal2");
          modal.style.display= "block";
        },
        export_csv:async function(){
          if( this.expt_period == null){
           alert('Choose a duration...')
          }
          else{
          fetch('http://127.0.0.1:5000/api/exportfor/'+ this.expt_period, {headers: { 'Content-Type': 'application/json', 'Authentication-Token': sessionStorage.getItem('auth_token')}} )
          .then(resp => resp.json())
          .then(data => {console.log(data);
            alert(data.message)
          })
          }
        },
        load_src: function(){
          this.src_page = this.src_page+1
          fetch('http://127.0.0.1:5000/api/src/'+this.src_user+'?page='+this.src_page, {headers: { 'Content-Type': 'application/json', 'Authentication-Token': sessionStorage.getItem('auth_token')}} )
          .then(resp => resp.json())
          .then(data => {this.src_result = data;
            if(data == null){
              msg = document.getElementById("no_result")
              msg.innerHTML = '<br> <b> Your search has no more matches <b>'
              this.src_page = this.src_page-1
            }
          })
          .catch(err => console.log(err.message))
        }
       
        
					},
	

    created: function(){
        fetch('http://127.0.0.1:5000/api/user', {headers: { 'Content-Type': 'application/json', 'Authentication-Token': sessionStorage.getItem('auth_token')}} )
        .then(resp => resp.json())
        .then(data => {
            this.username = data.username;
            return fetch('http://127.0.0.1:5000/api/feed/'+this.username+'?page=1', {headers: { 'Content-Type': 'application/json', 'Authentication-Token': sessionStorage.getItem('auth_token')}} )
        })
        .then(resp => resp.json())
        .then(data => {
            this.record = data;  
            this.page =1;
            if (this.record.length== 0){
              ele = document.getElementById("oops message")
              ele.innerHTML = '<div style="margin-top:20px;"> <h1> Oops no posts. Lets follow some people </h1> <div>'
            }
            
        })
        .catch(err => console.log(err.message))
    },

	
}

)

const profile = Vue.component('profile', {
    props: ["username" , "logged_as"],
    template: `
    <div>
	<div class="container">
  <div class ="row justify-content-center"> <div class="col-10">
    <div class="row">
    <div style="background-color:	#797ef6; background-image: linear-gradient(to right, #2b65ec, #ebfcff); padding: 15px ">  
        <a class="logout" style="float:right; margin-top:15px;  margin-left:20px" href="/logout" role="button"><h3><i class="bi bi-box-arrow-right"></i></h3></a>
        <h5 style="float:right; margin-top:20px;  margin-left:20px;cursor:pointer;" @click="go_to_my_profile"> <i class="bi bi-person-circle"></i> {{ logged_as }}  </h5>  <h5 style="float:right; margin-top:20px;  margin-left:20px;cursor:pointer;"><i class="bi bi-house-door-fill" @click="feed"></i> </h5>
        <h2 class="display-5"> <i class="bi bi-person-lines-fill"></i> Profile  </h2> 

     </div>
 </div>
        <div class="row">
        <div class="col-4">
            <div class="row justify-content-center">
                <img class="rounded-circle" :src=dp style=" margin-top:40px;margin-right:10px; max-height:200px;max-width:200px; padding-right:0; padding-left:0;aspect-ratio:1/1">
            </div>
                         
        </div>
        <div class="col">
            <div class="row justify-content-start">
                <div class="display-6" style="margin-top: 10px">About  <i v-if="username == logged_as" style="float:right;cursor:pointer;font-size:1.5rem;"class="bi bi-pencil-square" @click="edit_profile"> </i> </div> 
                <p style="margin-top: 20px" v-html="about"> </p>
            </div>
           </div> 
            </div>

            <div class="row">
              <div class="col-4" style="margin-right:10px">
                <div class="row">
                  <div class="display-6 " style="margin-top: 40px" v-html="uname" ></div>
                  <div class="display-8 " style="margin-top: 20px">@{{ user_name }}</div>
                  <div class="display-8 " style="margin-top: 20px"><i class="bi bi-geo-alt-fill"></i>{{ location }}</div>
              </div>   

              </div>
              
              <div class="col">
                <div class="row" style="margin-top: 40px;font-size:2rem;">
                  <div class="col"> 
                      <div class="row justify-content-center ">{{ posts_count }}</div>
                      <div class="row justify-content-center">Posts</div>
                  </div>
                  <div class="col">
                      <div class="row justify-content-center ">{{ follower_count }}</div>
                      <div class="row "><a  style="text-decoration:none; text-align: center;cursor:pointer" @click="show_followers()" > Followers</a></div>
                      </div>
                  <div class="col">
                      <div class="row justify-content-center ">{{ following_count }}</div>
                      <div class="row "><a  style="text-decoration:none; text-align:center; cursor:pointer" @click="show_following()"> Following</a></div>
                      </div>
              
                      </div>
                      </div>
                      <div v-for="t in record">
                      <div class="row" style="padding: 30px">
                          <div class="col-sm-12">
                            <div class="card">
                            
                              <div class="card-body">
                              <i v-if="logged_as == username" class="bi bi-trash" style="float:right;cursor:pointer;" @click="delete_post_conf(t.id)"></i>
                              <i v-if="logged_as == username" class="bi bi-pencil" style="float:right;margin-right:10px;cursor:pointer;" @click="edit_post(t.id, t.caption, t.body, t.image)"></i>
                                
                                <h5 class="card-title" v-html="t.caption"></h5>
                                <p class="card-text" v-html="t.body"></p>
                                <div class="row justify-content-center">
                                <img style="max-height:600px;max-width:500px;border-radius:30px " :src= "t.image" class="col-sm-6">
                                </div>
                                
                              </div>
                            </div>
                          </div>
                     
                  </div>
                  
              </div>
              
            </div>
            <br>
            <div v-if="record.length ==0"> <h1 style="text-align:center"> No Posts yet </h1> </div>  
            <br>
            <div v-if="record.length >0">
                  <div style="text-align:center">
                    <h3>
                      <div style="display: inline-block;cursor:pointer;"  @click="previous_page"> <i class="bi bi-caret-left-fill"></i></div>
                      <div style="display: inline-block;cursor:pointer;"  @click="next_page"> <i class="bi bi-caret-right-fill"></i> </div>
                    </h3>
                  </div>
              </div>
            </div>

            
    <div class="modal" id="modal1" tabindex="-1" @click.self="close">
      <div class="modal-content">
        <h5> Followers </h5>
        <div v-if="src_result != null" > <div v-for="item in src_result" style="margin-top:20px;" class="row align-items-center" > <div class="col" style="cursor:pointer;"@click="profile(item.user)">@{{item.user}}</div> <div  class="col"><button v-if="item.status == 0" class="btn btn-info" style="float:right" @click="follow_user(item.user); item.status=1"> Follow </button> <button v-if="item.status == 1" class="btn btn-outline-info" style="float:right" @click="unfollow_user(item.user); item.status=0" > Unfollow </button> </div>   </div> </div> 
        <h3 v-else style="margin-top: 30px"> Oops.  no followers </h3>
      </div>
    </div>

    <div class="modal" id="modal2" tabindex="-1" @click.self="close">
      <div class="modal-content">
        <h5> Following </h5>
        <div v-if="src_result != null" > <div v-for="item in src_result" style="margin-top:20px;" class="row align-items-center" > <div class="col" style="cursor:pointer;" @click="profile(item)">@{{item}}</div> <div class="col"><button class="btn btn-outline-info" style="float:right" @click="unfollow_user(item); src_result.splice(src_result.indexOf(item),1)" > Unfollow </button> </div>   </div> </div>
        <h3 v-else style="margin-top: 30px"> Oops. no following </h3>
      </div>
    </div>

    <div class="modal" id="modal3"  tabindex="-1" @click.self="close">
      <div class="modal-content">
      <h3> Confirmation </h3>
      <p> Delete this post? </P>
      <div class ="row">
      <div>
      <button class="btn btn-warning"  @click="delete_post(delete_post_id)"> Yes</button> <button class="btn btn-outline-warning" style="float:right" @click="close"> No</button> </div>
      </div>
      </div>
      </div>

</div>
        </div>    
    </div>
       </div>
    
    </div> </div></div>
    `,
	data: function() {
        return {
			      id :null,
            uname :null,
            dp:null,
            user_name :this.username,
            location :null,
            about:null,
            follower_count :null,
            following_count :null,
            posts_count :null,
            src_result: null,
            record:[],
            delete_post_id: null,
            page: 1
		}
        },
	methods: {
        
        show_following:function(){
          var modal = document.getElementById("modal2");
          modal.style.display= "block";
          fetch('http://127.0.0.1:5000/api/following/'+ this.username, {headers: { 'Content-Type': 'application/json', 'Authentication-Token': sessionStorage.getItem('auth_token')}} )
          .then(resp => resp.json())
          .then(data => {
            if(data.length > 0){
            this.src_result = data;}
          })
        },
        show_followers:function(){
          var modal = document.getElementById("modal1");
          modal.style.display= "block";
          fetch('http://127.0.0.1:5000/api/followers/'+ this.username, {headers: { 'Content-Type': 'application/json', 'Authentication-Token': sessionStorage.getItem('auth_token')}} )
          .then(resp => resp.json())
          .then(data => {
            if(data.length > 0){
            this.src_result = data;}
          })
        },
        feed:function(){
          //this.$router.push({name: 'dashboard'})
          this.$router.replace({name: 'dashboard'});
        },
        edit_profile:function(){
         //this.$router.push({name:"edit_profile", params: {"id": this.id,"uname": this.uname,"username": this.username,"location": this.location,"about": this.about}});
         this.$router.replace({name:"edit_profile", params: {"id": this.id,"uname": this.uname,"username": this.username,"location": this.location,"about": this.about}});
        },
        close:function(){
          this.src_result =null;
          var modal = document.querySelectorAll(".modal");
          modal[0].style.display= "none";
          modal[1].style.display= "none";
          modal[2].style.display= "none";
          
        },
        follow_user:function(user){
            fetch('http://127.0.0.1:5000/api/following', {
              method: 'POST',
              headers: {
                'Authentication-Token': sessionStorage.getItem('auth_token'),
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ 'follower': this.username, 'followed': user})
            }).then(resp => resp.json())
            .then(data => console.log(data))
            .catch(error => {
              console.error('Error:', error);
            });
            this.following_count = this.following_count+1
        },
        unfollow_user(user){
          fetch('http://127.0.0.1:5000/api/following/'+ this.username + '/' + user, {
            method: 'DELETE',
            headers: {
              'Authentication-Token': sessionStorage.getItem('auth_token')
            }
          })
          .then(resp => resp.json())
          .then(data => console.log(data))
          .catch(error => console.log(error.message))
          this.following_count = this.following_count-1
         },
        edit_post:function(tid, caption, body, image){
          //this.$router.push({name: 'edit_post', params: { "post_id": tid, "username": this.username, "caption": caption, "body":body, "image":image}});
          this.$router.replace({name: 'edit_post', params: { "post_id": tid, "username": this.username, "caption": caption, "body":body, "image":image}});
        },
        delete_post:function(tid){

          this.posts_count =this.posts_count - 1;
          fetch('http://127.0.0.1:5000/api/posts/delete/'+ tid, {
            method: 'DELETE',
            headers: {
              'Authentication-Token': sessionStorage.getItem('auth_token')
            }
           } )
           .then(resp => resp.json())
           .then(data => {
            return fetch('http://127.0.0.1:5000/api/posts/'+this.username+'?page='+this.page, {headers: { 'Content-Type': 'application/json', 'Authentication-Token': sessionStorage.getItem('auth_token')}} ) })
          .then(resp => resp.json())
          .then(data => {
            if(data != null){
            this.record = data;
            }
            else{
              this.page = this.page-1;
              alert("No more posts!");
            }
          })
          .catch(err => console.log(err.message));

          this.delete_post_id = null;
          modal = document.getElementById('modal3')
          modal.style.display= "none";
        },
        profile:function(user){
          //this.$router.push({name:"dummyrouter", params: {"user": user, "logged_as": this.logged_as}});
          this.$router.replace({name:"dummyrouter", params: {"user": user, "logged_as": this.logged_as}});
        },
        delete_post_conf:function(tid){
          this.delete_post_id = tid;
          var modal = document.getElementById("modal3");
          modal.style.display= "block";

        },
        go_to_my_profile:function(){
          //this.$router.push({name:"dummyrouter", params: {"user": this.logged_as, "logged_as": this.logged_as}});
          this.$router.replace({name:"dummyrouter", params: {"user": this.logged_as, "logged_as": this.logged_as}});
        },
        next_page: function(){
          this.page = this.page+1;
          fetch('http://127.0.0.1:5000/api/posts/'+this.username+'?page='+this.page, {headers: { 'Content-Type': 'application/json', 'Authentication-Token': sessionStorage.getItem('auth_token')}} )
          .then(resp => resp.json())
          .then(data => {
            if(data != null){
            this.record = data;
            document.documentElement.scrollTop = 0;
            }
            else{
              this.page = this.page-1;
              alert("No more posts!");
            }
          })
          .catch(err => console.log(err.message))
          
      },
      previous_page: function(){
        if( this.page >1){
        this.page = this.page-1;
        fetch('http://127.0.0.1:5000/api/posts/'+this.username+'?page='+this.page, {headers: { 'Content-Type': 'application/json', 'Authentication-Token': sessionStorage.getItem('auth_token')}} )
        .then(resp => resp.json())
        .then(data => {
          this.record = data;
          document.documentElement.scrollTop = 0;
          })
        .catch(err => console.log(err.message))
       }
       
					},

        },
  created: function(){
        if (this.username == undefined || this.logged_as == undefined){
          this.$router.replace({name: 'dashboard'});
        }
        else{
        fetch('http://127.0.0.1:5000/api/profile/' + this.username, {headers: { 'Content-Type': 'application/json', 'Authentication-Token': sessionStorage.getItem('auth_token')}} )
        .then(resp => resp.json())
        .then(data => {
            this.uname = data.name;
            this.id = data.id;
            this.dp = data.dp;
      this.location=data.location;
            this.about = data.about;
            this.follower_count =data.follower_count;
            this.following_count =data.following_count;
            this.posts_count = data.posts_count;
            this.follows =data.follows;
            this.followers = data.followers;
            this.posts = data.posts;
        })
        .catch(err => console.log(err.message))
        fetch('http://127.0.0.1:5000/api/posts/'+ this.username + '?page=1', {headers: { 'Content-Type': 'application/json', 'Authentication-Token': sessionStorage.getItem('auth_token')}} )
        .then(resp => resp.json())
        .then(data => this.record = data)
        .catch(err => console.log(err.message))
    }}
	
},
)


const edit_profile = Vue.component('edit_profile', {
props : ["id", "uname", "username", "location" ,"about"],
template: `<div class="container">

<div class ="row justify-content-center"><div class="col-10">
<div class="row ">

        <div style="background-color:	#797ef6; background-image: linear-gradient(to right, #2b65ec, #ebfcff); padding: 15px ">  
            <a class="logout" style="float:right; margin-top:15px;  margin-left:20px" href="/logout" role="button"><h3><i class="bi bi-box-arrow-right"></i></h3></a>
            <h5 style="float:right; margin-top:15px; margin-left:20px" > <i class="bi bi-person-circle"></i> {{ username }}</h5> 
            <h2 class="display-5">  <i class="bi bi-pencil-fill"></i> Edit Profile  </h2> 
         </div> 
</div>

<div class="row ">
  <div class="col text-black ">
    <div class=" d-flex justify-content-center    h-80  mt-5 mb-5 pt-5">
      <div style="border-style: solid ; border-color: #6698ff; border-radius: 15px; width:100%; background-color: white;">
        <div style="padding: 25px">

          <form method ="post" action="/test" enctype="multipart/form-data" id="form1">
          
          <div class="form-outline  mb-5">
            <input type="text" class="form-control form-control-lg" v-model="n_name" id="name"  name="name" required >
            <label class="form-label" for="name">Name</label> 
          </div>
          <div class="form-outline  mb-5">
            <input type="text" class="form-control form-control-lg" v-model="n_location" id="location" name="location" required >
            <label class="form-label" for="location">Location</label> 
          </div>
          <div class="form-outline  mb-5">
            <textarea class="form-control form-control-lg" v-model="n_about" id="about" name="about" rows="3" placeholder="Write something..."></textarea>
          </div>
          <div class="form-outline  mb-5">
            <label style="margin-right:2rem" class="form-label" for="file">Add a profile picture <i class="bi bi-person-bounding-box"></i></label> <input type="file" accept="image/jpeg, image/png, image/jpg" name="image" id="file">
            

          </div>
          <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="img_flag" id="checkbox1">
                <label class="form-check-label" for="checkbox1">
                  Delete profile picture
                </label>
              </div>
        </form>
          <div >
            <button @click="send" class="btn btn-info btn-lg">Save</button>
            <button @click="cancel" class="btn btn-outline-info btn-lg float-end">Cancel</button>
          </div>
        </div> 
      </div>
    </div> 
  </div>
</div>
</div> 
</div></div> `,
data:function(){
  return {
    n_name: null,
    n_location: null,
    n_about: null,
    n_dp: null,
    img_flag: null
  }
},

methods:{

  send: async function(){
    form = document.getElementById("form1");
    const formData = new FormData(form);
    if (this.img_flag ==true){
    await fetch('http://127.0.0.1:5000/api/profile/edit/'+ this.username + '?delete_image=true', {
      method: 'PATCH',
      headers: {	
				'Authentication-Token': sessionStorage.getItem('auth_token')
			},
      body: formData
    })
    .catch(error => {
      console.error('Error:', error);
    });}
    else{
      await fetch('http://127.0.0.1:5000/api/profile/edit/'+ this.username, {
      method: 'PATCH',
      headers: {			
				'Authentication-Token': sessionStorage.getItem('auth_token')
			},
      body: formData
    })
    .catch(error => {
      console.error('Error:', error);
    });
    }
    //this.$router.push({name:"profile", params: {"username": this.username, "logged_as": this.username}});
    this.$router.replace({name:"profile", params: {"username": this.username, "logged_as": this.username}});
  },
  cancel:function(){
    //this.$router.push({name:"profile", params: {"username": this.username, "logged_as": this.username}});
    this.$router.replace({name:"profile", params: {"username": this.username, "logged_as": this.username}});
  }

},

created:function(){
    this.n_name = this.uname;
    this.n_location = this.location;
    this.n_about = this.about;
}
})


const edit_post = Vue.component('edit_post', {
props : ["post_id", "username", "body", "caption", "image"],
template: `
<div class="container">
    
<div class ="row justify-content-center"><div class="col-10">

<div class="row ">

            <div style="background-color:	#797ef6; background-image: linear-gradient(to right, #2b65ec, #ebfcff); padding: 15px ">  
                <a class="logout" style="float:right; margin-top:15px;  margin-left:20px" href="/logout" role="button"><h3><i class="bi bi-box-arrow-right"></i></h3></a>
                <h5 style="float:right; margin-top:15px; margin-left:20px" > <i class="bi bi-person-circle"></i> {{ username }}</h5> 
                <h2 class="display-5">  <i class="bi bi-pencil-fill"></i>Edit Post</h2> 
             </div> 
    </div>

    <div class="row ">
      <div class="col text-black ">
        <div class=" d-flex justify-content-center h-80 mt-5 mb-5 pt-5 ">
          <div style="border-style: solid ; border-color: #6698ff; border-radius: 15px; width:100%;; background-color: white;">
            <div style=" padding: 25px">
    
            <form method ="post" action="/test" enctype="multipart/form-data" id="form1">
              
              <div class="form-outline  mb-2">
                <input type="text" class="form-control form-control-lg" v-model="n_caption" id="caption" name="caption" required placeholder="Add a caption...">
              </div>
              <div class="form-outline  mb-5">
                <textarea class="form-control form-control-lg" v-model="n_body" id="body" rows="5" name="body" placeholder="Write something..."> </textarea>
              </div>
              <div class="form-outline  mb-5">
                <input type="file" accept="image/jpeg,image/png,image/jpg" name="image" :src="image" id="file">

              </div>
              
                <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="img_flag" id="checkbox1">
                <label class="form-check-label" for="checkbox1">
                  Delete image for this post
                </label>
              </div>
              </form>
              <div >
                <button @click="send" class="btn btn-info btn-lg" >Save changes</button>
                <button @click="cancel" class="btn btn-outline-info btn-lg float-end">Cancel</button>
              </div>
            </div> 
          </div>
        </div> 
      </div>
    </div>
  </div>  </div> </div>
`,
data:function(){
  return {
    n_caption: null,
    n_body: null,
    n_img: null,
    id:null,
    img_flag: null
  }
},

methods:{
 send: async function(){
  form = document.getElementById("form1");
    const formData = new FormData(form);
    if( this.img_flag == true){
    await fetch('http://127.0.0.1:5000/api/posts/edit/' + this.post_id+ '?delete_image=true', {
      method: 'PATCH',
      headers: {
				
				'Authentication-Token': sessionStorage.getItem('auth_token')
			},
      body: formData
    })
    
    .catch(error => {
      console.error('Error:', error);
    });}
    else{
      await fetch('http://127.0.0.1:5000/api/posts/edit/' + this.post_id, {
      method: 'PATCH',
      headers: {				
				'Authentication-Token': sessionStorage.getItem('auth_token')
			},
      body: formData
    })
    .catch(error => {
      console.error('Error:', error);
    });
    }
    //this.$router.push({name:"profile", params: {"username": this.username, "logged_as": this.username}});
    this.$router.replace({name:"profile", params: {"username": this.username, "logged_as": this.username}});
 },
 cancel:function(){
  //this.$router.push({name:"profile", params: {"username": this.username, "logged_as": this.username}});
  this.$router.replace({name:"profile", params: {"username": this.username, "logged_as": this.username}});
 }

},

created:function(){
  this.id =this.post_id;
  this.n_caption = this.caption;
  this.n_body = this.body
 
}
})

const settings = Vue.component('settings', {
  props : ['username'],
  template: `
  <div class = "container">
  <div class ="row justify-content-center"> <div class="col-10">
  <div class="row">
  <div style="background-color:	#797ef6; background-image: linear-gradient(to right, #2b65ec, #ebfcff); padding: 15px ">  
      <a class="logout" style="float:right; margin-top:15px; margin-right:20px; margin-left:20px" href="/logout" role="button"><h3><i class="bi bi-box-arrow-right"></i></h3></a>
      <h5 style="float:right; margin-top:20px; margin-right:20px; margin-left:20px" > <i class="bi bi-person-circle"></i> {{ username }}  </h5>  <h5 style="float:right; margin-top:20px; margin-right:20px; margin-left:20px; cursor:pointer"><i class="bi bi-house-door-fill" @click="feed"></i> </h5>
      <h2 class="display-5"> <i class="bi bi-gear-fill"></i> Settings</h2> 

   </div></div>
  <div class ="row" style="margin-top:30px;">
  <div class="form-outline  mb-2">
  <div class = "form-label"><b> Add a google chat group link to receive notifications on Chat </b></div>
  <input type="text" class="form-control form-control-lg" v-model="linktext" id="link" name="link" required >
  <button class ="btn btn-primary" style="margin-top:20px;" @click="add"> Save changes </button>
</div>
</div>
</div></div>
  </div>
  `,
  data:function(){
    return {
      linktext: null,
    }
  },
  
  methods:{
  add:function(){
    record = {"hook": this.linktext}
    fetch('http://127.0.0.1:5000/api/add_hook', {
              method: 'POST',
              headers: {
                
                'Authentication-Token': sessionStorage.getItem('auth_token'),
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(record)
            })
            .catch(error => {
              console.error('Error:', error);
            });
    this.$router.replace({name: 'dashboard'});
  },
  feed:function(){

    //this.$router.push({name: 'dashboard'})
    this.$router.replace({name: 'dashboard'});
  }
  },
  created:function(){
    fetch('http://127.0.0.1:5000/api/add_hook', {headers: { 'Content-Type': 'application/json', 'Authentication-Token': sessionStorage.getItem('auth_token')}} )
          .then(resp => resp.json())
          .then(data => this.linktext = data.hook)
  }
  })


const new_post= Vue.component('new_post', {
props : ["username" ],
template: `
<div class="container">
    
<div class ="row justify-content-center"><div class="col-10">

<div class="row ">

            <div style="background-color:	#797ef6; background-image: linear-gradient(to right, #2b65ec, #ebfcff); padding: 15px ">  
                <a class="logout" style="float:right; margin-top:15px;margin-left:20px" href="/logout" role="button"><h3><i class="bi bi-box-arrow-right"></i></h3></a>
                <h5 style="float:right; margin-top:15px; margin-left:20px" > <i class="bi bi-person-circle"></i> {{ username }}</h5> 
                <h2 class="display-5">  <i class="bi bi-bookmark-star"></i> New Post  </h2> 
             </div> 
    </div>

    <div class="row ">
      <div class="col text-black ">
        <div class=" d-flex justify-content-center h-80 mt-5 mb-5 pt-5">
          <div style="border-style: solid; width:100%; border-color: #6698ff; border-radius: 15px; ; background-color: white;">
            <div style="padding: 25px">
    
            <form method ="post" action="/test" enctype="multipart/form-data" id="form1">
              
              <div class="form-outline  mb-2">
                <input type="text" class="form-control form-control-lg" v-model="caption" id="caption" name="caption" required placeholder="Add a caption...">
              </div>
              <div class="form-outline  mb-5">
                <textarea class="form-control form-control-lg" v-model="body" id="body" rows="5" name="body" placeholder="Write something..."></textarea>
              </div>
              <div class="form-outline  mb-5">
                <input type="file" accept="image/jpeg, image/png, image/jpg" name="image" id="file">

              </div>
              
              
              </form>
              <div >
                <button @click="send" class="btn btn-info btn-lg" >Add</button>
                <button @click="cancel" class="btn btn-outline-info btn-lg float-end">Cancel</button>
              </div>
            </div> 
          </div>
        </div> 
      </div>
    </div>
  </div>  </div> </div>
`,
data:function(){
  return {
    caption: null,
    body: null,
    img: null,
    //timestamp: null
  }
},

methods:{
 send:function(){
  //this.timestamp = Date.now();
  //console.log(this.timestamp);
  form = document.getElementById("form1");
    const formData = new FormData(form);
    fetch('http://127.0.0.1:5000/api/posts', {
      method: 'POST',
      headers: {				
				'Authentication-Token': sessionStorage.getItem('auth_token')
			},
      body: formData
    })
    .catch(error => {
      console.error('Error:', error);
    });
    //this.$router.push({name: 'dashboard'})
    this.$router.replace({name: 'dashboard'});
 },
 cancel:function(){
  //this.$router.push({name: 'dashboard'});
  this.$router.replace({name: 'dashboard'});
 
 }
},

created:function(){
  //this.timestamp = Date.now();
}
})



const dummy_router = Vue.component('dummyrouter', {
  props : ["user", "logged_as"],
  template: `
  <div>
  {{reroute}} </div>`,
  data:function(){
    return {
     target:null,
     owner: null,
    }
  },
  methods:{
  },
  computed:{
    reroute: function(){
      return (this.owner != null && this.target !=null) ? this.$router.replace({name:"profile", params: {"username": this.user, "logged_as": this.logged_as}}) : 'error'
    }
  },
  created:function(){
    this.target =  this.user;
    this.owner = this.logged_as;
  }
}
)



const routes = [
	{
		path: '/',
		component: dashboard,
		name: 'dashboard'
	},
    {
		path: '/profile',
		component: profile,
		name: 'profile',
        props: true
	},
  {
		path: '/edit_profile',
		component: edit_profile,
		name: 'edit_profile',
        props: true
	},
  {
		path: '/new_post',
		component: new_post,
		name: 'new_post',
        props: true
	},
  {
		path: '/edit_post',
		component: edit_post,
		name: 'edit_post',
        props: true
	},
  {
		path: '/dummyrouter',
		component: dummy_router,
		name: 'dummyrouter',
    props: true
       
	},
  {
		path: '/settings',
		component: settings,
		name: 'settings',
    props: true
       
	},

]


const router = new VueRouter({
	routes
})

var app= new Vue({
	router: router,
    el: '#app'
})