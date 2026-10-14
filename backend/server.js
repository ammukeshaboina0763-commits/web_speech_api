const express=require('express');
const cors=require('cors')
require('dotenv').config();
const pool=require('./db')
const app=express();
app.use(cors({
    origin:'http://localhost:3000'
}));
app.use(express.json());
app.get('/',(req,res)=>{
    res.json({
        message:"Speech Transcription Backend is running"
    })
})
app.get('/api/transcriptions',async(req,res)=>{
    try{
        
        const result=await pool.query('SELECT * FROM transcriptions ORDER BY created_at DESC');
        res.json(result.rows);
    }catch(err){
        console.error(err.message);
        res.status(500).json({ error: 'failed to fetch transcriptions' });
    }
})
app.post('/api/transcriptions',async(req,res)=>{
    try{
        const{transcript}=req.body;
        if(typeof transcript !=='string' || !transcript.trim()){
            return res.status(400).json({
                message:'transcription cannot be empty'
            })
        }
        const result=await pool.query(
            `  INSERT INTO transcriptions (transcript) VALUES($1) RETURNING *`,
            [transcript.trim()]
        )
        res.status(201).json({
            message:'transcription saved successfully',
            transcription:result.rows[0]
        })
        }
    catch(err){
        console.log(err.message);
        res.status(500).json({
            message:'failed to save transcription'
        })
    }}
)
app.delete('api/transcriptions/:id',async(req,res)=>{
    try{
    const id=Number(req.params.id);
    if(!Number.isInteger(id) || id<=0){
        return res.status(400).json({
            message:'Invalid transcription ID'
        })
    }
    const result=await pool.query(
        'DELETE FROM transcriptions WHERE id=$1 RETURNING id',
        [id]
    )
    if(result.rows.length>0){
        res.json({
            message:'transcription deleted successfully'
        })
    }else{
        res.status(404).json({
            message:'transcription not found'
        })
    }}
    catch(error){
        console.log(error.message);
        res.status(500).json({
            message:'failed to delete transcription'
        })
    }
})

async function startServer(){
    try{
        await pool.query('SELECT 1');
        console.log('postgres database connected successfully');
        const PORT=process.env.PORT ||8000;
        app.listen(PORT,()=>{
            console.log(`server is running on port ${PORT}`);
        })
    }catch(error){
        console.log("database connection failed:",error.message)
        process.exit(1)
    }
}
startServer();