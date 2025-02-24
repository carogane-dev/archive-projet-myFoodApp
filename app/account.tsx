// Account.tsx
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, TouchableWithoutFeedback, Keyboard } from "react-native";
import { getAuth, signOut, updateProfile } from "firebase/auth"; // Assurez-vous que getAuth est importé correctement
import { db } from "../config/firebaseConfig"; // Assurez-vous que db est bien importé
import { doc, getDoc, setDoc } from "firebase/firestore"; // Pour manipuler Firestore

export default function Account() {
  const [user, setUser] = useState<any>(null);
  const [newPseudo, setNewPseudo] = useState<string>("Pas défini");
  const [newPoids, setNewPoids] = useState<string>("Pas défini");
  const [newEmail, setNewEmail] = useState<string>("Pas défini");
  const [originalPseudo, setOriginalPseudo] = useState<string>("Pas défini");
  const [originalPoids, setOriginalPoids] = useState<string>("Pas défini");
  const [originalEmail, setOriginalEmail] = useState<string>("Pas défini");

  const [isEditingPseudo, setIsEditingPseudo] = useState<boolean>(false);
  const [isEditingPoids, setIsEditingPoids] = useState<boolean>(false);
  const [isEditingEmail, setIsEditingEmail] = useState<boolean>(false);

  const auth = getAuth(); // Obtenez l'objet auth ici

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      setNewEmail(currentUser.email || "Pas défini");
      const userDocRef = doc(db, "users", currentUser.uid);
      getDoc(userDocRef).then((docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setNewPseudo(data.pseudo || "Pas défini");
          setNewPoids(data.poids || "Pas défini");
          setOriginalPseudo(data.pseudo || "Pas défini");
          setOriginalPoids(data.poids || "Pas défini");
          setOriginalEmail(data.email || "Pas défini");
        }
      });
    }
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  const updateUserInfoInFirestore = async (uid: string, pseudo: string, poids: string, email: string) => {
    const userDocRef = doc(db, "users", uid);
    await setDoc(userDocRef, { pseudo, poids, email }, { merge: true });
  };

  const handleUpdatePseudo = async () => {
    if (user && newPseudo !== originalPseudo) {
      await updateUserInfoInFirestore(user.uid, newPseudo, newPoids, user.email || "");
      setOriginalPseudo(newPseudo);
      setIsEditingPseudo(false);
    }
  };

  const handleUpdatePoids = async () => {
    if (user && newPoids !== originalPoids) {
      await updateUserInfoInFirestore(user.uid, newPseudo, newPoids, user.email || "");
      setOriginalPoids(newPoids);
      setIsEditingPoids(false);
    }
  };

  const cancelEdit = () => {
    setNewPseudo(originalPseudo);
    setNewPoids(originalPoids);
    setNewEmail(originalEmail);
    setIsEditingPseudo(false);
    setIsEditingPoids(false);
    setIsEditingEmail(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView contentContainerStyle={styles.container}>
        {user ? (
          <>
            <Text style={styles.title}>Mon Compte</Text>

            {/* Pseudo */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Pseudo :</Text>
              {isEditingPseudo ? (
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={newPseudo}
                    onChangeText={setNewPseudo}
                  />
                  <TouchableOpacity onPress={handleUpdatePseudo}>
                    <Text style={styles.button}>Valider</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={cancelEdit}>
                    <Text style={styles.button}>Annuler</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputValue}>{newPseudo}</Text>
                  <TouchableOpacity onPress={() => setIsEditingPseudo(true)}>
                    <Text style={styles.button}>Modifier</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Poids */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Poids :</Text>
              {isEditingPoids ? (
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={newPoids}
                    onChangeText={setNewPoids}
                  />
                  <TouchableOpacity onPress={handleUpdatePoids}>
                    <Text style={styles.button}>Valider</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={cancelEdit}>
                    <Text style={styles.button}>Annuler</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputValue}>{newPoids}</Text>
                  <TouchableOpacity onPress={() => setIsEditingPoids(true)}>
                    <Text style={styles.button}>Modifier</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Déconnexion */}
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.logout}>Se déconnecter</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text>Chargement...</Text>
        )}
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  input: {
    width: 200,
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  inputValue: {
    fontSize: 18,
  },
  button: {
    fontSize: 16,
    color: "#007bff",
  },
  logout: {
    color: "red",
    fontSize: 18,
    marginTop: 20,
    textAlign: "center",
  },
});
