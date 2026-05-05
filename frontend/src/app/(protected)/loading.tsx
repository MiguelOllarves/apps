export default function LoadingDashboard() {
  return (
    <div className="min-h-screen bg-[#1E1E2D] p-6 lg:p-10 flex flex-col gap-6 animate-pulse">
      <div className="h-12 w-1/3 bg-[#2B2C40] rounded-xl mb-4"></div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 h-48 bg-[#2B2C40] rounded-2xl"></div>
        <div className="lg:col-span-8 h-48 bg-[#2B2C40] rounded-2xl"></div>
        <div className="lg:col-span-8 h-80 bg-[#2B2C40] rounded-2xl"></div>
        <div className="lg:col-span-4 h-80 bg-[#2B2C40] rounded-2xl"></div>
      </div>
    </div>
  );
}
