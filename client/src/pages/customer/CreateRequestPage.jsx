import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Upload, X, MapPin, FileText,
  CheckCircle2, Image as ImageIcon, Wrench, Camera, Link2, Sparkles,
  Eye, Plus, FileQuestion, AlertCircle, CreditCard, ShieldCheck,
  Laptop, Wind, Zap, Droplets, Package, Paintbrush, RotateCcw, Layers
} from 'lucide-react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { Button, Input, Card, Badge } from '../../components/common';
import serviceApi from '../../services/service.api';
import requestApi from '../../services/request.api';
import uploadApi from '../../services/upload.api';
import { useAuth } from '../../contexts/AuthContext';
import { initiateRazorpayPayment } from '../../utils/razorpay';
import toast from 'react-hot-toast';

const STEPS = ['Service', 'Details', 'Images', 'Location', 'Review'];

// Curated realistic breakdown demonstration photos with exact problem images
const SAMPLE_PRESETS = [
  // HVAC
  { label: 'AC Water Leakage', url: '/demo-presets/ac-water-leak.jpg', tag: 'HVAC', desc: 'Indoor AC unit dripping water' },
  { label: 'Dirty AC Filter Clog', url: '/demo-presets/ac-dirty-filter.jpg', tag: 'HVAC', desc: 'Dust-clogged cooling mesh' },

  // Electrical
  { label: 'Circuit Breaker Tripped', url: '/demo-presets/circuit-breaker.jpg', tag: 'Electrical', desc: 'Distribution panel trip' },
  { label: 'Burnt Wall Socket', url: '/demo-presets/burnt-socket.jpg', tag: 'Electrical', desc: 'Scorched smoke-damaged plug' },
  { label: 'Ceiling Fan Wiring', url: '/demo-presets/ceiling-fan-wiring.jpg', tag: 'Electrical', desc: 'Loose motor coil connection' },

  // Plumbing
  { label: 'Pipe Water Drain Leak', url: '/demo-presets/pipe-water-leak.jpg', tag: 'Plumbing', desc: 'Under-sink pipe joint leak' },
  { label: 'Clogged Sink Drain', url: '/demo-presets/clogged-sink.jpg', tag: 'Plumbing', desc: 'Basin standing murky water' },

  // Electronics
  { label: 'Cracked Phone Screen', url: '/demo-presets/cracked-phone.jpg', tag: 'Electronics', desc: 'Shattered display glass' },
  { label: 'Motherboard Damage', url: '/demo-presets/motherboard-damage.jpg', tag: 'Electronics', desc: 'Burnt PCB chip components' },

  // Appliances
  { label: 'Washing Machine Leak', url: '/demo-presets/washing-machine-leak.jpg', tag: 'Appliances', desc: 'Door seal water puddle' },
  { label: 'Refrigerator Ice Frost', url: '/demo-presets/fridge-frost.jpg', tag: 'Appliances', desc: 'Freezer excessive frost buildup' },

  // Painting
  { label: 'Wall Damp & Paint Peel', url: '/demo-presets/wall-peeling-paint.jpg', tag: 'Painting', desc: 'Bubbling flaky moisture wall' },
  { label: 'Structural Wall Crack', url: '/demo-presets/wall-crack.jpg', tag: 'Painting', desc: 'Deep vertical plaster crack' },
];

const PRESET_CATEGORIES = [
  { id: 'All', label: 'All Issues', icon: Layers },
  { id: 'HVAC', label: 'HVAC', icon: Wind },
  { id: 'Electrical', label: 'Electrical', icon: Zap },
  { id: 'Plumbing', label: 'Plumbing', icon: Droplets },
  { id: 'Electronics', label: 'Electronics', icon: Laptop },
  { id: 'Appliances', label: 'Appliances', icon: Package },
  { id: 'Painting', label: 'Painting', icon: Paintbrush },
];

const getCategoryIcon = (slugOrName = '') => {
  const s = slugOrName.toLowerCase();
  if (s.includes('electr') && !s.includes('appliance')) {
    if (s.includes('tronic')) return Laptop;
    return Zap;
  }
  if (s.includes('hvac') || s.includes('air') || s.includes('cool')) return Wind;
  if (s.includes('plumb') || s.includes('pipe') || s.includes('leak')) return Droplets;
  if (s.includes('appliance')) return Package;
  if (s.includes('paint')) return Paintbrush;
  return Wrench;
};

const DRAFT_STORAGE_KEY = 'fixit_create_request_draft';

const loadDraft = () => {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export default function CreateRequestPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const prefillParam = location.state?.prefillService || queryParams.get('category') || queryParams.get('service') || '';

  // ── Restore saved draft if user previously left or refreshed ──
  const initialDraft = useRef(loadDraft()).current;

  const [step, setStep] = useState(() => (typeof initialDraft?.step === 'number' ? initialDraft.step : 0));
  const [submittingAction, setSubmittingAction] = useState(null); // 'payLater' | 'payOnline' | null
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(() => initialDraft?.selectedCategory || null);

  // Upload state supporting both File objects and direct URLs
  const [uploadedItems, setUploadedItems] = useState(() => initialDraft?.urlItems || []);
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [previewModalUrl, setPreviewModalUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasDraft, setHasDraft] = useState(!!initialDraft);
  const [presetFilter, setPresetFilter] = useState('All');

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [form, setForm] = useState(() => {
    if (initialDraft?.form) {
      return {
        serviceId: initialDraft.form.serviceId || '',
        title: initialDraft.form.title || (prefillParam ? `${prefillParam} Service` : ''),
        description: initialDraft.form.description || '',
        priority: typeof initialDraft.form.priority === 'number' ? initialDraft.form.priority : 0,
        location: {
          address: initialDraft.form.location?.address || '',
          city: initialDraft.form.location?.city || '',
          state: initialDraft.form.location?.state || '',
          zipCode: initialDraft.form.location?.zipCode || '',
          country: initialDraft.form.location?.country || 'India',
        },
        imageUrls: [],
      };
    }
    return {
      serviceId: '',
      title: prefillParam ? `${prefillParam} Service` : '',
      description: '',
      priority: 0,
      location: { address: '', city: '', state: '', zipCode: '', country: 'India' },
      imageUrls: [],
    };
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    serviceApi.getCategories().then((res) => {
      const cats = res.data?.categories || [];
      setCategories(cats);
      const prefill = prefillParam;
      // If user came with explicit prefill from URL and there is no draft category selected, use prefill
      if (prefill && cats.length > 0 && !selectedCategory) {
        const matched = cats.find((c) =>
          c.name.toLowerCase().includes(prefill.toLowerCase()) ||
          c.slug?.toLowerCase().includes(prefill.toLowerCase())
        );
        if (matched) {
          setSelectedCategory(matched.id);
        }
      }
    }).catch(() => {});
  }, [location.state, location.search, prefillParam, selectedCategory]);

  useEffect(() => {
    if (selectedCategory) {
      serviceApi.getServices({ categoryId: selectedCategory, limit: 50 })
        .then((res) => setServices(res.data || []))
        .catch(() => {});
    }
  }, [selectedCategory]);

  // ── Auto-save progress to localStorage on any form or step change ──
  useEffect(() => {
    const hasAnyInput =
      step > 0 ||
      selectedCategory ||
      form.serviceId ||
      (form.title && form.title !== `${prefillParam} Service`) ||
      form.description ||
      form.location.address ||
      uploadedItems.length > 0;

    if (!hasAnyInput) return;

    try {
      const urlItems = uploadedItems
        .filter((i) => i.type === 'url')
        .map((i) => ({
          type: 'url',
          url: i.url,
          name: i.name,
          format: i.format,
          size: i.size,
        }));

      const draftData = {
        step,
        selectedCategory,
        form: {
          serviceId: form.serviceId,
          title: form.title,
          description: form.description,
          priority: form.priority,
          location: form.location,
        },
        urlItems,
        savedAt: Date.now(),
      };

      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
      setHasDraft(true);
    } catch {
      // Ignore private mode / storage quota errors
    }
  }, [step, selectedCategory, form, uploadedItems, prefillParam]);

  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {}
    setHasDraft(false);
    setStep(0);
    setSelectedCategory(null);
    setUploadedItems([]);
    setForm({
      serviceId: '',
      title: prefillParam ? `${prefillParam} Service` : '',
      description: '',
      priority: 0,
      location: { address: '', city: '', state: '', zipCode: '', country: 'India' },
      imageUrls: [],
    });
    setErrors({});
    toast.success('Draft reset. You can start fresh.');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setForm((prev) => ({ ...prev, location: { ...prev.location, [field]: value } }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const processFiles = (files) => {
    if (uploadedItems.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const newItems = files.map((file) => {
      const ext = file.name.split('.').pop()?.toUpperCase() || 'IMG';
      const sizeKB = Math.round(file.size / 1024);
      const sizeStr = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;

      return {
        type: 'file',
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        format: ext,
        size: sizeStr,
      };
    });

    setUploadedItems((prev) => [...prev, ...newItems]);
    toast.success(`${files.length} image(s) added`);
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleAddUrl = (e) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
      toast.error('Please enter a valid HTTP/HTTPS image URL');
      return;
    }
    if (uploadedItems.length >= 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setUploadedItems((prev) => [
      ...prev,
      {
        type: 'url',
        url: inputUrl.trim(),
        name: 'Web Image',
        format: 'LINK',
        size: 'External',
      },
    ]);
    setInputUrl('');
    setUrlModalOpen(false);
    toast.success('Image link attached!');
  };

  const handleAttachPreset = (preset) => {
    if (uploadedItems.length >= 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    setUploadedItems((prev) => [
      ...prev,
      {
        type: 'url',
        url: preset.url,
        name: preset.label,
        format: preset.tag,
        size: 'Demo Preset',
      },
    ]);
    toast.success(`Attached ${preset.label} sample!`);
  };

  const handleRemoveItem = (index) => {
    setUploadedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 0 && !form.serviceId) newErrors.serviceId = 'Select a service';
    if (step === 1) {
      if (!form.title.trim()) newErrors.title = 'Title is required';
      if (form.title.length < 5) newErrors.title = 'Title must be at least 5 characters';
      if (!form.description.trim()) newErrors.description = 'Description is required';
      if (form.description.length < 10) newErrors.description = 'At least 10 characters';
    }
    if (step === 3) {
      if (!form.location.address.trim()) newErrors['location.address'] = 'Address is required';
      if (!form.location.city.trim()) newErrors['location.city'] = 'City is required';
      if (!form.location.state.trim()) newErrors['location.state'] = 'State is required';
      if (!form.location.zipCode.trim()) newErrors['location.zipCode'] = 'Zip code is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { user } = useAuth();

  const nextStep = () => {
    if (validateStep()) setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = async (shouldPayNow = false) => {
    if (!validateStep() || submittingAction) return;
    const action = shouldPayNow ? 'payOnline' : 'payLater';
    setSubmittingAction(action);
    try {
      // 1. Separate direct URLs and file objects to upload
      const directUrls = uploadedItems
        .filter((i) => i.type === 'url' && i.url)
        .map((i) => ({
          imageUrl: i.url.startsWith('/') ? `${window.location.origin}${i.url}` : i.url,
          caption: i.name || undefined,
        }));

      const filesToUpload = uploadedItems
        .filter((i) => i.type === 'file' && i.file)
        .map((i) => i.file);

      let serverUploadedUrls = [];
      if (filesToUpload.length > 0) {
        const uploadRes = await uploadApi.uploadImages(filesToUpload, 'requests');
        serverUploadedUrls = (uploadRes.data?.images || []).map((img) => ({
          imageUrl: typeof img === 'string' ? img : img.imageUrl,
          publicId: (typeof img === 'object' && img?.publicId) || undefined,
        }));
      }

      const allImageUrls = [...directUrls, ...serverUploadedUrls];

      const res = await requestApi.create({ ...form, imageUrls: allImageUrls });
      const createdRequest = res.data?.request;

      // Clear autosaved draft on successful submission
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        setHasDraft(false);
      } catch {}

      toast.success('Service request created successfully!');

      if (shouldPayNow && createdRequest?.id) {
        await initiateRazorpayPayment({
          requestId: createdRequest.id,
          user,
          onSuccess: () => {
            setSubmittingAction(null);
            navigate(`/customer/requests/${createdRequest.id}`);
          },
          onFailure: () => {
            setSubmittingAction(null);
            navigate(`/customer/requests/${createdRequest.id}`);
          },
          onCancel: () => {
            setSubmittingAction(null);
            navigate(`/customer/requests/${createdRequest.id}`);
          },
        });
      } else {
        setSubmittingAction(null);
        navigate('/customer/requests/active');
      }
    } catch (error) {
      const errMsg = error.response?.data?.errors?.length
        ? error.response.data.errors.map((e) => e.message).join(', ')
        : (error.response?.data?.message || 'Failed to create request');
      toast.error(errMsg);
      setSubmittingAction(null);
    }
  };

  const selectedService = services.find((s) => s.id === form.serviceId);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
        {/* Header with Autosave Status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-surface-900">New Service Request</h1>
            <p className="text-surface-500 mt-0.5">Tell us what needs fixing</p>
          </div>

          {hasDraft && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Progress Auto-saved
              </span>
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="inline-flex items-center gap-1 text-xs text-surface-500 hover:text-danger-600 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-200 font-medium"
                title="Discard saved draft and start fresh"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Form</span>
              </button>
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between gap-1 sm:gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0
                transition-all duration-300
                ${i < step ? 'bg-accent-500 text-white' : i === step ? 'bg-primary-600 text-white shadow-glow' : 'bg-surface-200 text-surface-500'}
              `}>
                {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`hidden sm:block text-sm font-medium ${i <= step ? 'text-surface-800' : 'text-surface-400'}`}>
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 rounded ${i < step ? 'bg-accent-400' : 'bg-surface-200'}`} />
              )}
            </div>
          ))}
        </div>

        <Card className="p-6 sm:p-8">
          {/* Step 0: Service Selection */}
          {step === 0 && (
            <div className="space-y-6 animate-slide-up">
              <h2 className="text-lg font-semibold text-surface-900">Choose a Category &amp; Service</h2>

              {/* Categories */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {categories.map((cat) => {
                  const Icon = getCategoryIcon(cat.slug || cat.name);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setForm((prev) => ({ ...prev, serviceId: '' }));
                      }}
                      className={`p-3.5 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/40 shadow-xs'
                          : 'border-surface-200 dark:border-surface-300 hover:border-surface-300 bg-white dark:bg-surface-200'
                      }`}
                    >
                      <Icon className="w-6 h-6 mx-auto mb-1.5 text-primary-600 dark:text-primary-400" />
                      <p className="text-xs sm:text-sm font-bold text-surface-900">{cat.name}</p>
                    </button>
                  );
                })}
              </div>

              {/* Services List */}
              {selectedCategory && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-semibold text-surface-700">Select Specific Service</h3>
                  {services.length === 0 ? (
                    <div className="p-5 text-center rounded-2xl border border-dashed border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-800">
                      <p className="text-sm text-surface-500">
                        No specific services listed under this category yet.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                      {services.map((svc) => (
                        <button
                          key={svc.id}
                          type="button"
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              serviceId: svc.id,
                              title: (!prev.title || prev.title.endsWith('Service')) ? `${svc.name} Service` : prev.title,
                            }));
                            if (errors.serviceId) setErrors((prev) => ({ ...prev, serviceId: '' }));
                          }}
                          className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                            form.serviceId === svc.id
                              ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/40 shadow-xs'
                              : 'border-surface-200 dark:border-surface-300 hover:border-surface-300 bg-white dark:bg-surface-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-surface-900">{svc.name}</p>
                            <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                              ₹{svc.basePrice || svc.price || 249}
                            </span>
                          </div>
                          {svc.description && (
                            <p className="text-xs text-surface-500 mt-1 line-clamp-1">{svc.description}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {errors.serviceId && <p className="text-sm text-danger-600">{errors.serviceId}</p>}
            </div>
          )}

          {/* Step 1: Details */}
          {step === 1 && (
            <div className="space-y-5 animate-slide-up">
              <h2 className="text-lg font-semibold text-surface-900">Describe the problem</h2>
              <Input label="Title" name="title" placeholder="e.g. AC not cooling properly" icon={FileText} value={form.title} onChange={handleChange} error={errors.title} />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-surface-700">Description</label>
                <textarea
                  name="description"
                  rows={5}
                  placeholder="Describe the issue in detail..."
                  className="w-full rounded-xl border border-surface-200 dark:border-surface-300 bg-white dark:bg-surface-200 text-surface-900 placeholder:text-surface-400 dark:placeholder:text-surface-500 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  value={form.description}
                  onChange={handleChange}
                />
                {errors.description && <p className="text-sm text-danger-600">{errors.description}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-surface-700">Priority</label>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {[{ v: 0, l: 'Normal' }, { v: 1, l: 'High' }, { v: 2, l: 'Urgent' }].map((p) => (
                    <button
                      key={p.v}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, priority: p.v }))}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all cursor-pointer ${
                        form.priority === p.v
                          ? p.v === 2 ? 'border-danger-500 bg-danger-50 dark:bg-danger-950/40 text-danger-700 dark:text-danger-300' : p.v === 1 ? 'border-warning-500 bg-warning-50 dark:bg-warning-950/40 text-warning-700 dark:text-warning-300' : 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300'
                          : 'border-surface-200 dark:border-surface-300 bg-white dark:bg-surface-200 text-surface-600 hover:border-surface-300'
                      }`}
                    >
                      {p.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Upload Images (All Format Options & Sources) ── */}
          {step === 2 && (
            <div className="space-y-6 animate-slide-up">
              <div>
                <h2 className="text-lg font-bold text-surface-900">Upload Images &amp; Media (Optional)</h2>
                <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
                  Add photos of the problem to help the technician diagnose the issue with the right tools.
                </p>
              </div>

              {/* Hidden file & camera inputs */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.svg,.bmp,.ico,.heic,.heif,.tiff"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <input
                type="file"
                ref={cameraInputRef}
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Upload Source Action Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Browse Files */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2.5 p-3 rounded-2xl bg-primary-50 dark:bg-primary-950/50 hover:bg-primary-100 dark:hover:bg-primary-900/50 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 font-bold text-xs transition-all cursor-pointer shadow-2xs"
                >
                  <Upload className="w-4 h-4 shrink-0" />
                  <span>Browse Device Files</span>
                </button>

                {/* 2. Camera Snapshot */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center justify-center gap-2.5 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition-all cursor-pointer shadow-2xs"
                >
                  <Camera className="w-4 h-4 shrink-0" />
                  <span>Take Live Photo</span>
                </button>

                {/* 3. Link from URL */}
                <button
                  type="button"
                  onClick={() => setUrlModalOpen(true)}
                  className="flex items-center justify-center gap-2.5 p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold text-xs transition-all cursor-pointer shadow-2xs"
                >
                  <Link2 className="w-4 h-4 shrink-0" />
                  <span>Paste Image URL</span>
                </button>
              </div>

              {/* Drag & Drop Main Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3
                  ${isDragging
                    ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-950/60 scale-[1.01]'
                    : 'border-surface-300 dark:border-surface-400 bg-surface-50 dark:bg-surface-200/40 hover:border-primary-400 hover:bg-primary-50/20'
                  }
                `}
              >
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-surface-200 shadow-sm border border-surface-200 dark:border-surface-300 flex items-center justify-center text-primary-600">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-surface-900">
                    Drag and drop photos here, or <span className="text-primary-600 dark:text-primary-400 underline">browse</span>
                  </p>
                  <p className="text-xs text-surface-500">
                    Supports any image format: <strong>JPEG, PNG, WebP, GIF, SVG, BMP, HEIC, TIFF</strong> (Max 5 photos, 10MB each)
                  </p>
                </div>
              </div>

              {/* Previews Grid */}
              {uploadedItems.length > 0 && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-surface-700 uppercase tracking-wider">
                      Attached Photos ({uploadedItems.length}/5)
                    </p>
                    <button
                      type="button"
                      onClick={() => setUploadedItems([])}
                      className="text-xs font-semibold text-danger-600 hover:underline"
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {uploadedItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="relative group aspect-square rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-300 shadow-2xs bg-surface-100 dark:bg-surface-300"
                      >
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />

                        {/* Format Tag */}
                        <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-white backdrop-blur-xs">
                          {item.format}
                        </span>

                        {/* Hover Overlay Actions */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setPreviewModalUrl(item.url); }}
                            className="p-1.5 rounded-full bg-white/90 text-surface-900 hover:bg-white transition-colors"
                            title="Preview Image"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleRemoveItem(idx); }}
                            className="p-1.5 rounded-full bg-danger-600 text-white hover:bg-danger-700 transition-colors"
                            title="Remove Photo"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample Issue Presets (Quick attach) */}
              <div className="pt-4 border-t border-surface-200 dark:border-surface-300 space-y-3.5">
                {/* Header & Subtitle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-surface-900 dark:text-slate-100 flex items-center gap-2">
                        Quick Demo Photos
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50">
                          One-Click Attach
                        </span>
                      </h4>
                      <p className="text-[11px] text-surface-500 dark:text-slate-400">
                        Click any real breakdown issue below to attach sample photo for testing
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-surface-500 dark:text-slate-400 self-start sm:self-auto bg-surface-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-surface-200/60 dark:border-slate-700">
                    Showing {SAMPLE_PRESETS.filter((p) => presetFilter === 'All' || p.tag === presetFilter).length} photos
                  </span>
                </div>

                {/* Category Filter Tabs Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 touch-scroll-x scrollbar-none">
                  {PRESET_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const count = cat.id === 'All'
                      ? SAMPLE_PRESETS.length
                      : SAMPLE_PRESETS.filter((p) => p.tag === cat.id).length;
                    const isActive = presetFilter === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setPresetFilter(cat.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/30'
                            : 'bg-surface-100 dark:bg-slate-800 text-surface-700 dark:text-slate-200 hover:bg-surface-200 dark:hover:bg-slate-700 hover:text-surface-900 dark:hover:text-white border border-surface-200/80 dark:border-slate-700'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-surface-500 dark:text-slate-400'}`} />
                        <span>{cat.label}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            isActive
                              ? 'bg-blue-500 text-white'
                              : 'bg-surface-200/80 dark:bg-slate-700 text-surface-600 dark:text-slate-300'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Presets Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {SAMPLE_PRESETS.filter((p) => presetFilter === 'All' || p.tag === presetFilter).map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleAttachPreset(preset)}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-800/90 hover:bg-blue-50/60 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700/90 hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer group text-left shadow-2xs hover:shadow-sm"
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-11 h-11 rounded-lg object-cover border border-slate-200/80 dark:border-slate-700 group-hover:scale-105 transition-transform shrink-0"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-xs font-bold text-surface-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                            {preset.label}
                          </span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-100 dark:bg-slate-700 text-surface-600 dark:text-slate-300 shrink-0">
                            {preset.tag}
                          </span>
                        </div>
                        <p className="text-[11px] text-surface-500 dark:text-slate-400 truncate mt-0.5">
                          {preset.desc}
                        </p>
                      </div>
                      <div className="w-6 h-6 rounded-lg bg-surface-100 dark:bg-slate-700 group-hover:bg-blue-600 group-hover:text-white text-surface-500 dark:text-slate-300 flex items-center justify-center transition-colors shrink-0">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <div className="space-y-4 animate-slide-up">
              <h2 className="text-lg font-semibold text-surface-900">Service Location</h2>
              <Input label="Address" name="location.address" placeholder="Flat / House no, Street, Landmark" icon={MapPin} value={form.location.address} onChange={handleChange} error={errors['location.address']} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input label="City" name="location.city" placeholder="e.g. Mumbai" value={form.location.city} onChange={handleChange} error={errors['location.city']} />
                <Input label="State" name="location.state" placeholder="e.g. Maharashtra" value={form.location.state} onChange={handleChange} error={errors['location.state']} />
                <Input label="PIN Code" name="location.zipCode" placeholder="e.g. 400001" value={form.location.zipCode} onChange={handleChange} error={errors['location.zipCode']} />
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-5 animate-slide-up">
              <h2 className="text-lg font-semibold text-surface-900">Review &amp; Submit</h2>
              <div className="space-y-3 divide-y divide-surface-200 dark:divide-surface-300 text-sm">
                <div className="pt-2 flex justify-between">
                  <span className="text-surface-500">Service:</span>
                  <span className="font-bold text-surface-900">{selectedService?.name || 'Selected Service'}</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-surface-500">Title:</span>
                  <span className="font-medium text-surface-900">{form.title}</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-surface-500">Description:</span>
                  <span className="font-medium text-surface-900 max-w-xs text-right truncate">{form.description}</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-surface-500">Priority:</span>
                  <Badge variant={form.priority === 2 ? 'danger' : form.priority === 1 ? 'warning' : 'primary'} size="sm">
                    {form.priority === 2 ? 'Urgent' : form.priority === 1 ? 'High' : 'Normal'}
                  </Badge>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-surface-500">Address:</span>
                  <span className="font-medium text-surface-900 text-right">
                    {form.location.address}, {form.location.city}, {form.location.state} - {form.location.zipCode}
                  </span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-surface-500">Images Attached:</span>
                  <span className="font-medium text-surface-900">{uploadedItems.length} photos</span>
                </div>

                {/* Pricing Estimate Card */}
                <div className="pt-3">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800/60 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <p className="text-xs font-bold text-blue-900 dark:text-blue-200">Standard Service Estimate</p>
                      </div>
                      <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-0.5">Includes initial diagnosis & verified technician visit</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-primary-600 dark:text-primary-400">
                        ₹{selectedService?.basePrice || 499}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 mt-6 border-t border-surface-200 dark:border-surface-300">
            {step > 0 ? (
              <Button type="button" variant="secondary" icon={ArrowLeft} onClick={prevStep} className="w-full sm:w-auto">
                Back
              </Button>
            ) : <div />}

            {step < STEPS.length - 1 ? (
              <Button type="button" icon={ArrowRight} iconPosition="right" onClick={nextStep} className="w-full sm:w-auto">
                Next
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="secondary"
                  loading={submittingAction === 'payLater'}
                  disabled={!!submittingAction}
                  onClick={() => handleSubmit(false)}
                  className="w-full sm:w-auto text-xs"
                >
                  Book Service (Pay Later)
                </Button>
                <Button
                  type="button"
                  loading={submittingAction === 'payOnline'}
                  disabled={!!submittingAction}
                  onClick={() => handleSubmit(true)}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 font-extrabold text-white shadow-md shadow-blue-600/20 text-xs flex items-center justify-center gap-1.5"
                >
                  ⚡ Book & Pay Online (₹{selectedService?.basePrice || 499})
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Modal: Paste Image URL */}
        {urlModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-[#151F32] w-full max-w-md rounded-3xl p-6 border border-surface-200 dark:border-surface-300 shadow-2xl space-y-4 animate-scale-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-purple-600" />
                  <h3 className="text-base font-bold text-surface-900">Attach Image by URL</h3>
                </div>
                <button
                  onClick={() => setUrlModalOpen(false)}
                  className="p-1 rounded-xl text-surface-400 hover:text-surface-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-surface-500">
                Paste any valid web image link (JPEG, PNG, WebP, SVG, etc.) to attach to your service ticket.
              </p>
              <form onSubmit={handleAddUrl} className="space-y-4">
                <input
                  type="url"
                  placeholder="https://example.com/broken-appliance.jpg"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-surface-200 dark:border-surface-300 bg-surface-50 dark:bg-surface-200 text-xs sm:text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
                <div className="flex items-center justify-end gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setUrlModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="font-bold">
                    Attach Image
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Fullscreen Preview */}
        {previewModalUrl && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-pointer"
            onClick={() => setPreviewModalUrl(null)}
          >
            <div className="relative max-w-2xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl">
              <img src={previewModalUrl} alt="Preview" className="w-full h-full object-contain max-h-[80vh]" />
              <button
                onClick={() => setPreviewModalUrl(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
