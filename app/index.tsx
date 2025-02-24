import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput
} from "react-native";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, deleteDoc, doc, query, where, updateDoc } from "firebase/firestore";
import { useRouter, useLocalSearchParams } from "expo-router";
import { db } from "../config/firebaseConfig";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

interface Food {
  id: string;
  name: string;
  weight: string;
  quantity: string;
  description?: string;
  expiryDate?: string;
  userId: string;
}

const auth = getAuth();

export default function Aliments() {
  const [user, setUser] = useState<any>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>("");
  const [newWeight, setNewWeight] = useState<string>("");
  const [newQuantity, setNewQuantity] = useState<string>("");
  const [newDescription, setNewDescription] = useState<string>("");
  const [newExpiryDate, setNewExpiryDate] = useState<Date | null>(null);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  const router = useRouter();
  // Récupération du paramètre "category" transmis depuis Main (ex. "viandes", "fruits", "légumes", etc.)
  const { category } = useLocalSearchParams() as { category?: string };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchFoods(user.uid);
      } else {
        setUser(null);
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchFoods(user.uid);
    }
  }, [category, user]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchFoods(user.uid);
      }
    }, [user, category])
  );

  const fetchFoods = async (userId: string) => {
    const foodsQuery = query(collection(db, "foods"), where("userId", "==", userId));
    const querySnapshot = await getDocs(foodsQuery);
    const fetchedFoods: Food[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Food[];

    const validFoods = fetchedFoods.filter(
      (food) => food.expiryDate && !isNaN(new Date(food.expiryDate).getTime())
    );
    validFoods.sort(
      (a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime()
    );

    let finalFoods = validFoods;
    if (category) {
      finalFoods = validFoods.filter(
        (food) =>
          (food.description ?? "").toLowerCase() === category.toLowerCase()
      );
    }
    setFoods(finalFoods);
  };

  const deleteFood = async (id: string) => {
    await deleteDoc(doc(db, "foods", id));
    fetchFoods(user?.uid);
    setSelectedFood(null);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsMenuVisible(false);
    router.push("/login");
  };

  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  const toggleFoodDetails = (food: Food) => {
    if (selectedFood && selectedFood.id === food.id) {
      setSelectedFood(null);
      setIsEditing(false);
    } else {
      setSelectedFood(food);
      setIsEditing(false);
    }
  };

  const startEditing = (food: Food) => {
    setNewName(food.name);
    setNewWeight(food.weight);
    setNewQuantity(food.quantity);
    setNewDescription(food.description || "");
    setNewExpiryDate(food.expiryDate ? new Date(food.expiryDate) : new Date());
    setIsEditing(true);
  };

  const handleUpdateFood = async (id: string) => {
    const foodRef = doc(db, "foods", id);
    await updateDoc(foodRef, {
      name: newName || undefined,
      weight: newWeight || undefined,
      quantity: newQuantity || undefined,
      description: newDescription || undefined,
      expiryDate: newExpiryDate ? newExpiryDate.toISOString() : undefined
    });
    setNewName("");
    setNewWeight("");
    setNewQuantity("");
    setNewDescription("");
    setNewExpiryDate(null);
    setIsEditing(false);
    fetchFoods(user?.uid);
  };

  const getFoodStatusColor = (expiryDate: string) => {
    const currentDate = new Date();
    const expirationDate = new Date(expiryDate);
    const diffInTime = expirationDate.getTime() - currentDate.getTime();
    const diffInDays = diffInTime / (1000 * 3600 * 24);
    if (diffInDays < 0) return "#FF6347";
    else if (diffInDays <= 2) return "#FFA500";
    else return "#FFFFFF";
  };

  const getButtonTextColor = (backgroundColor: string) => {
    return backgroundColor === "#FF6347" || backgroundColor === "#FFA500" ? "#FFFFFF" : "#000000";
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    setIsDatePickerVisible(false);
    if (selectedDate) {
      setNewExpiryDate(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <View style={styles.header}>
            {category && (
              <TouchableOpacity style={styles.backButton} onPress={() => router.push("/categories")}>
                <Text style={styles.backButtonText}>Retour</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.titleButton}
              onPress={() => router.push({ pathname: "/categories", params: {} })}
            >
              <Text style={styles.titleText}>Accueil</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleMenu}>
              <Text style={styles.profileButton}>👤</Text>
            </TouchableOpacity>
          </View>
          {isMenuVisible && (
            <TouchableWithoutFeedback onPress={() => setIsMenuVisible(false)}>
              <View style={styles.overlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.profileMenu}>
                    <Text style={styles.emailText}>{user.email}</Text>
                    <Button title="Mon compte" onPress={() => router.push("/account")} />
                    <Button title="Déconnexion" onPress={handleLogout} color="#FF6347" />
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          )}
          <Button title="Ajouter un aliment" onPress={() => router.push("/add")} />
          <FlatList
            data={foods}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const statusColor = getFoodStatusColor(item.expiryDate!);
              const textColor = getButtonTextColor(statusColor);
              return (
                <View style={[styles.foodCard, { backgroundColor: statusColor }]}>
                  <View style={styles.row}>
                    <TouchableOpacity style={styles.nameContainer} onPress={() => toggleFoodDetails(item)}>
                      <Text style={styles.foodName}>{item.name}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteFood(item.id)}>
                      <Ionicons name="trash" size={24} color={textColor} />
                    </TouchableOpacity>
                  </View>
                  {selectedFood && selectedFood.id === item.id && (
                    <View>
                      {item.name && <Text>Nom: {item.name}</Text>}
                      {item.weight && <Text>Poids: {item.weight}</Text>}
                      {item.quantity && <Text>Quantité: {item.quantity}</Text>}
                      {item.description && <Text>Description: {item.description}</Text>}
                      {item.expiryDate && (
                        <Text>
                          Date d'expiration:{" "}
                          {format(new Date(item.expiryDate), "d MMM yyyy", { locale: fr })}
                        </Text>
                      )}
                      <Button title="Supprimer" onPress={() => deleteFood(item.id)} color={textColor} />
                      <Button title="Modifier" onPress={() => startEditing(item)} color={textColor} />
                    </View>
                  )}
                  {selectedFood && selectedFood.id === item.id && isEditing && (
                    <View style={styles.foodDetails}>
                      <TextInput style={styles.input} placeholder="Nom" value={newName} onChangeText={setNewName} />
                      <TextInput style={styles.input} placeholder="Poids" value={newWeight} onChangeText={setNewWeight} />
                      <TextInput style={styles.input} placeholder="Quantité" value={newQuantity} onChangeText={setNewQuantity} />
                      <TextInput style={styles.input} placeholder="Description" value={newDescription} onChangeText={setNewDescription} />
                      <TouchableOpacity onPress={() => setIsDatePickerVisible(true)}>
                        <Text style={styles.input}>
                          Date d'expiration:{" "}
                          {newExpiryDate ? format(newExpiryDate, "d MMM yyyy", { locale: fr }) : "Choisir une date"}
                        </Text>
                      </TouchableOpacity>
                      {isDatePickerVisible && (
                        <DateTimePicker
                          value={newExpiryDate || new Date()}
                          mode="date"
                          display="default"
                          onChange={handleDateChange}
                        />
                      )}
                      <Button title="Valider" onPress={() => handleUpdateFood(item.id)} color="#4CAF50" />
                    </View>
                  )}
                </View>
              );
            }}
          />
        </>
      ) : (
        <Text style={styles.notLoggedInText}>
          Veuillez vous connecter pour accéder à vos aliments.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f4f4f4" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    marginBottom: 20
  },
  backButton: { backgroundColor: "#fff", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4 },
  backButtonText: { color: "#4CAF50", fontWeight: "bold" },
  titleButton: { flex: 1, alignItems: "center" },
  titleText: { fontSize: 24, color: "#fff", fontWeight: "bold" },
  profileButton: { fontSize: 24 },
  foodCard: { padding: 10, marginBottom: 10, borderRadius: 8, elevation: 3 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  nameContainer: { flex: 1 },
  foodName: { fontSize: 18, fontWeight: "bold" },
  input: { height: 40, borderColor: "#ccc", borderWidth: 1, marginBottom: 10, paddingLeft: 8, borderRadius: 5 },
  notLoggedInText: { fontSize: 16, color: "#FF6347", textAlign: "center" },
  foodDetails: { padding: 10 },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1 },
  profileMenu: { backgroundColor: "#fff", padding: 20, zIndex: 2, position: "absolute", top: 40, right: 0, left: "auto", width: "90%", borderRadius: 10 },
  emailText: { fontSize: 18, marginBottom: 10 }
});
