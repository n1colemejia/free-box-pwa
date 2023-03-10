import styles from '../styles/Login.module.css';
import 'reactjs-popup/dist/index.css';

import clippings from '../public/images/clippings.jpeg';
import chair from '../public/images/chair.jpeg';
import candles from '../public/images/candles.jpeg';
import books from '../public/images/books.jpeg';
import boots from '../public/images/boots.jpeg';
import flowers from '../public/images/flowers.jpeg';
import purse from '../public/images/purse.jpeg';

import NavBar from '@/components/NavBar';
import Image from 'next/image';
import { Input, Button, Text } from '@nextui-org/react';
import Popup from 'reactjs-popup';
import { Draggable } from 'drag-react';

import { useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { UserContext } from '@/lib/context';

import { auth, firestore, googleAuthProvider, storage } from 'lib/firebase';
import { ref, uploadBytes, listAll, getDownloadURL } from 'firebase/storage';
import debounce from 'lodash.debounce';
import { v4 } from 'uuid';

export default function LoginPage(props) {
  // state
  const [openPopup, setOpenPopup] = useState(false);
  const [formValues, setFormValues] = useState({
    name: '',
    username: '',
    bio: '',
    profilePic: '',
  });
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageToUpload, setImageToUpload] = useState(null);
  const [imageURL, setImageURL] = useState('');

  // router 
  const router = useRouter();

  // context
  const { user, username } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // reference user & username docs
    const userRef = firestore.doc(`users/${user.uid}`);
    const usernameRef = firestore.doc(`usernames/${formValues.username}`);

    // commit both together as batch write
    const batch = firestore.batch();
    batch.set(userRef, {
      name: formValues.name, 
      username: formValues.username, 
      bio: formValues.bio,
      profilePic: imageURL,
    });
    batch.set(usernameRef, { uid: user.uid });

    await batch.commit();
  };
  
  // check username is in correct format
  const handleUsernameChange = (e) => {
    const val = e.target.value.toLowerCase();
    const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

    if (val.length < 3) {
      setFormValues(val);
      setLoading(false);
      setIsValid(false);
    }

    if (re.test(val)) {
      setFormValues(val);
      setLoading(true);
      setIsValid(false);
    }
    // maybe add username message here?
  };

  // handle user log in 
  const handleLogInWithGoogle = async () => {
    await auth.signInWithPopup(googleAuthProvider)
    .then(() => {
      !username ? setOpenPopup(true) : setOpenPopup(false);
    })
    .then(() => {
      router.push('/');
    })
  }

  useEffect(() => {
    checkUsername(formValues.username);
  }, [formValues.username]);

  // check firestore for username match/availability
  // debounce waits until user stops typing
  // useCallback required for debounce to work
  const checkUsername = useCallback(
    debounce(async (username) => {
      if (username.length >= 3) {
        const usernameRef = firestore.doc(`usernames/${username}`);
        const { exists } = await usernameRef.get();
        console.log('firestore read executed');

        setIsValid(!exists);
        setLoading(false);
      }
    }, 500),
    []);

    // open username form pop up event handler
    const handlePopup = () => {
      setOpenPopup(!openPopup);
    }

  // feedback for username availability/validity
  const usernameMessage = () => {
    if (loading) {
      return `Hmm...lets see...`;
    } else if (isValid) {
      return `How unique. ${formValues.username} is all yours.`;
    } else if (formValues.username && !isValid) {
      return 'SHES TAKEN TRY AGAIN';
    } else {
      return '';
    }
  };

  // set all form values
  const handleChange = (event) => {
    handleUsernameChange(event);
    setFormValues({...formValues, [event.target.name]: event.target.value});
  };

  // input file change event handler
  const handleFileChange = (imageFile) => {
    setImageToUpload(imageFile)
  }

  // upload image
  const uploadImage = () => {
    if (imageToUpload == null) return;
    const imageRef = ref(storage, `profile-pic/${formValues.username + v4()}`)
    uploadBytes(imageRef, imageToUpload)
    .then((snapshot) => {
      alert('Image Uploaded');
      getDownloadURL(snapshot.ref)
      .then((url) => {
        setImageURL(url);
        console.log(`imageURL: ${imageURL}`);
      })
    })
  };

  const content = (
    <div className={styles.div}>
            <h2 className={styles.slogan}>Upcycle with friends!</h2>
            <Draggable style={{position: 'absolute', left: '23rem', top: '7.5rem', zIndex: 2}}><Image className={styles.boots} src={boots} alt='boots'/></Draggable>
            <Draggable style={{position: 'absolute', left: '46rem', top: '24rem', zIndex: 2}}><Image className={styles.books} src={books} alt='boots'/></Draggable>
            <Draggable style={{position: 'absolute', left: '40rem', top: '6rem', zIndex: 1}}><Image className={styles.flowers} src={flowers} alt='books'/></Draggable>            
            {/* <Draggable style={{position: 'absolute', left: '38rem', top: '15rem', zIndex: 0}}><Image priority={true} className={styles.clippings} src={clippings} alt='lemons'/></Draggable> */}
            <Draggable style={{position: 'absolute', left: '62rem', top: '9rem', zIndex: 0}}><Image className={styles.chair} src={chair} alt='chair'/></Draggable>
            <Draggable style={{position: 'absolute', left: '4.5rem', top: '10rem', zIndex: 1}}><Image className={styles.candles} src={candles} alt='candles'/></Draggable>
    </div>
);

  return (
    <main>
      <Popup 
        open={openPopup}
        closeOnDocumentClick onClose={() => handlePopup()}
        >
          <form onSubmit={handleSubmit}>
            <Input 
              name='name'
              placeholder='name'
              value={formValues.name}
              onChange={handleChange}
              required
            />
            <Input 
              name='username'
              placeholder='username'
              value={formValues.username}
              onChange={handleChange}
            />
            <br />
            {usernameMessage()}
            <br />
            <Input 
              name='bio'
              placeholder='bio'
              value={formValues.bio}
              onChange={handleChange}
            />
            <br />
            <Input
              type='file'
              onChange={(event) => handleFileChange(event.target.files[0])}
            />
            <Button onPress={uploadImage}>Upload Image</Button>
            <Button type='submit' disabled={!isValid}>I want it!</Button>
          </form>
      </Popup>
      <div>
        {content}
      </div>
    </main>
  );
}