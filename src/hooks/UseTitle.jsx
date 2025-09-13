import React, { useEffect } from 'react'

export default function UseTitle(title){
  useEffect(()=>{
    document.title = title;
  },[title])
}

