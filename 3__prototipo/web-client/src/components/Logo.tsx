import logo from "@/assets/logo.svg";

export function Logo() {
  return (
    <div className="flex justify-center mb-6">
      <img src={logo} alt="idwall" className="h-8" />
    </div>
  );
}