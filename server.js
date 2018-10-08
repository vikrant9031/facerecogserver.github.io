const express=require('express');
const bodyParser=require('body-parser');
const bcrypt =require('bcrypt-nodejs');
const app= express();
const cors=require('cors');
const knex=require('knex');


 const postgres=knex ({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'vikrant',
    database : 'smartbrain'
  }
});

postgres.select('*').from('login').then(data=>{
	console.log(data);

})

const database={
	users:[
	{
		id:'123',
		name:'john',
		email:'john@gmail.com',
        password:'johnsingh',
		entries:0,
		joined:new Date()
	}
	]
	
	
}

app.use(bodyParser.json());
app.use(cors());


app.get('/',(req,res)=>{
res.json(database);
	
})

app.post('/log',(req,res)=>{
   postgres.select('email','hash').from('login')
   .where('email','=',req.body.email)
   .then(data=>{
   	
    const isValid= bcrypt.compareSync(req.body.password,data[0].hash); 
      if(isValid){
         return	postgres.select('*').from('login')
      	.where('email','=',req.body.email)
      	.then(user=>{
      		console.log(user);
      		res.json("success")
      		console.log("success")
      	})

      }
   })
})

app.post('/register',(req,res)=>{
	const {name,email,password}=req.body;

var hash = bcrypt.hashSync(password);

postgres.transaction(trx=>{
	trx.insert({
		hash:hash,
		email:email
	})
	.into('login')
      .returning('email')
        .then(ele=>{
        	return trx('log')
             .returning('*')
              .insert({
  	             email:ele[0],
  	             name:name,
  	             joined:new Date(),
  	             entries:2

  })
    .then(user => {
            res.json(user[0]);
            })


 }).then(trx.commit)
   .then(trx.rollback)
  
}).catch(err=>res.json('unable to register'))

})



app.get('/profile/:id',(req,res)=>{
	const {id}= req.params;

	postgres.select('*').from('log')
	.where({id:id}).then(user=>{
		if(user.length){
			res.json(user[0])
		}else{
			res.status(400).json('not found')
		}

		res.json(user[0])
	})
	
})

app.put('/image',(req,res)=>{
	const {id}= req.body;
	postgres('log').where('id','=',id)
	.increment('entry',1).returning('entry')
	.then(entry=>{
		res.json(entry[0]);
	})

	
	
})



/*bcrypt.compare("bacon", hash, function(err, res) {
   
});
bcrypt.compare("veggies", hash, function(err, res) {
    
});

*/
app.listen(3000,()=>{
	console.log('running');
})