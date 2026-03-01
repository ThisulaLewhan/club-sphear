import connectDB from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();
    return Response.json({ message: "Database connected successfully" });
  } catch (error) {
    return Response.json({ error: "Database connection failed" });
  }
}