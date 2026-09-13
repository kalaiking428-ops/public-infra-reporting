import React, { useState, useEffect } from 'react';
import { 
  Camera, MapPin, Navigation, AlertTriangle, CheckCircle2, 
  Upload, X, ArrowLeft, Send, Sparkles, HelpCircle, Phone, User, Mail
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { IssueMap } from '../components/IssueMap';
import { api } from '../services/api';

export function ReportIssuePage({ onNavigate, onSelectTicket }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submittedIssue, setSubmittedIssue] = useState(null);
  const [geoLocating, setGeoLocating] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [coords, setCoords] = useState({ lat: 13.0827, lng: 80.2707 }); // Default city coordinates
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');

  // Image upload
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    api.getCategories().then((data) => {
      setCategories(data);
      if (data.length > 0) setCategoryId(data[0].id);
    }).catch(console.error);

    // Initial reverse geocode
    handleReverseGeocode(13.0827, 80.2707);
  }, []);

  const handleReverseGeocode = async (lat, lng) => {
    try {
      const addr = await api.reverseGeocode(lat, lng);
      setAddress(addr);
    } catch {
      setAddress(`Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  const handleMapPick = (newCoords) => {
    setCoords(newCoords);
    handleReverseGeocode(newCoords.lat, newCoords.lng);
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCoords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setCoords(newCoords);
        handleReverseGeocode(newCoords.lat, newCoords.lng);
        setGeoLocating(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        alert('Could not access your location. Please click on the map to pin the issue.');
        setGeoLocating(false);
      },
      { timeout: 10000 }
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !categoryId || !address.trim()) {
      alert('Please fill in all mandatory fields.');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category_id', categoryId);
      formData.append('priority', priority);
      formData.append('latitude', coords.lat);
      formData.append('longitude', coords.lng);
      formData.append('address', address.trim());
      if (landmark.trim()) formData.append('landmark', landmark.trim());
      if (reporterName.trim()) formData.append('reporter_name', reporterName.trim());
      if (reporterEmail.trim()) formData.append('reporter_email', reporterEmail.trim());
      if (reporterPhone.trim()) formData.append('reporter_phone', reporterPhone.trim());
      if (imageFile) formData.append('image', imageFile);

      const result = await api.createIssue(formData);
      setSubmittedIssue(result);

      // Trigger Confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      alert('Error reporting issue: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // If submitted successfully, show confirmation screen
  if (submittedIssue) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-10 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Complaint Registered Successfully!
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Your grievance has been dispatched to the municipal municipal authority and assigned department.
            </p>
          </div>

          {/* Ticket ID Box */}
          <div className="p-5 bg-blue-50/80 border border-blue-200 rounded-2xl max-w-sm mx-auto">
            <span className="text-xs uppercase font-semibold tracking-wider text-blue-700 block mb-1">
              Your Tracking Ticket ID
            </span>
            <span className="text-3xl font-extrabold font-mono text-blue-900 tracking-wider">
              {submittedIssue.id}
            </span>
            <p className="text-xs text-blue-600/80 mt-1">
              Save this ID to track updates or add citizen remarks.
            </p>
          </div>

          <div className="text-left bg-slate-50 p-4 rounded-xl text-xs space-y-1.5 text-slate-600 border border-slate-200">
            <p><strong>Title:</strong> {submittedIssue.title}</p>
            <p><strong>Category:</strong> {submittedIssue.category_name || submittedIssue.category_id}</p>
            <p><strong>Assigned Dept:</strong> {submittedIssue.department_name || 'Roads & Infrastructure'}</p>
            <p><strong>Location:</strong> {submittedIssue.address}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => onSelectTicket(submittedIssue.id)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md transition"
            >
              Track Complaint Status
            </button>

            <button
              onClick={() => {
                setSubmittedIssue(null);
                setTitle('');
                setDescription('');
                setImageFile(null);
                setImagePreview(null);
              }}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition"
            >
              Report Another Issue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('home')}
          className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Report a Public Infrastructure Issue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Submit photographic evidence, pinpoint exact location, and alert local civic authorities.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Issue Classification */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
            Issue Details & Category
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Select */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Severity / Urgency */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Urgency / Safety Hazard *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              >
                <option value="Low">Low (Minor inconvenience)</option>
                <option value="Medium">Medium (Standard municipal repair)</option>
                <option value="High">High (Disrupting traffic or neighborhood)</option>
                <option value="Critical">Critical (Immediate safety / life hazard)</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Issue Headline / Summary *
            </label>
            <input
              type="text"
              placeholder="e.g. Deep crater pothole near pedestrian crossing"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Detailed Description *
            </label>
            <textarea
              rows={3}
              placeholder="Describe the issue in detail, dimensions, duration of problem, hazards caused..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            ></textarea>
          </div>
        </div>

        {/* Section 2: Photographic Evidence Upload */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
            Photo Evidence
          </h2>
          <p className="text-xs text-slate-500">
            Clear photographs allow authorities to assess equipment and materials required prior to dispatch.
          </p>

          {imagePreview ? (
            <div className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
              <img src={imagePreview} alt="Upload preview" className="w-full h-56 object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl cursor-pointer bg-slate-50 hover:bg-blue-50/50 transition duration-150">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
                  <Camera className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-700">Click to upload or drag & drop photo</p>
                <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, JPEG up to 10MB</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Section 3: Exact Geolocation & Map */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">3</span>
              Exact Location & Map Pin
            </h2>

            <button
              type="button"
              onClick={handleDetectGPS}
              disabled={geoLocating}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold transition"
            >
              <Navigation className={`w-3.5 h-3.5 ${geoLocating ? 'animate-spin' : ''}`} />
              {geoLocating ? 'Detecting GPS...' : 'Use My Current Location'}
            </button>
          </div>

          {/* Interactive Map Picker */}
          <IssueMap
            pickerMode={true}
            pickerCoords={coords}
            onPickCoords={handleMapPick}
            height="320px"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Address / Street Name *
              </label>
              <input
                type="text"
                placeholder="Auto-detected or enter street name..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Nearby Landmark (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Opposite Metro Station Pillar 120"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
            <span>Coordinates:</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">
              {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </span>
          </div>
        </div>

        {/* Section 4: Citizen Contact Info */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">4</span>
            Citizen Contact Information
          </h2>
          <p className="text-xs text-slate-500">
            Provide your details if you wish to receive SMS/Email updates when an officer is assigned.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Your Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  placeholder="rahul@example.com"
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  placeholder="e.g. 9840123456"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="px-6 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-sm transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Submitting Grievance...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Grievance</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
