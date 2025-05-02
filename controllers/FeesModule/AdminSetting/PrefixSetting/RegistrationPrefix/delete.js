import PrefixSetting from '../../../../../models/FeesModule/RegistrationPrefix.js';

export const deletePrefix = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      hasError: true,
      message: 'Prefix ID is required.',
    });
  }

  try {
    const deleted = await PrefixSetting.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        hasError: true,
        message: 'Prefix not found or already deleted.',
      });
    }

    res.status(200).json({
      hasError: false,
      message: 'Prefix deleted successfully.',
    });
  } catch (err) {
    console.error('Delete Prefix Error:', err);
    res.status(500).json({
      hasError: true,
      message: 'Server error while deleting prefix.',
    });
  }
};

export default deletePrefix;
