async function handleRegister() {
  if (!fullName || !dob || !phone) {
    alert("Please fill all required fields");
    return;
  }

  setLoading(true);

  const { data, error } = await supabase
    .from("customers")
    .insert({
      full_name: fullName,
      phone,
      dob,
      email: email || null,
      state: "active",
    })
    .select();

  setLoading(false);

  if (error) {
    alert("Registration failed: " + error.message);
    console.error("Registration error:", error);
    return;
  }

  router.push(`/otp?phone=${phone}`);
}
